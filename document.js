const https = require('https')
const url = require('url')
const qs = require('qs')
const fetch = require('node-fetch')
const Headers = require('node-fetch').Headers

// Utility functions and constants not to be exposed.
// This is a poor mans (and more functional) way of defining private
// members (is's a closure, after all).

const randomStringLength = 15
const CRLF = '\r\n'

const getDocumentsEndPointPath = (caseTypeId, caseInstance) => {

  const accountId = caseInstance.attributes.account_id
  const caseId = caseInstance.attributes._id

  return `/documents/${accountId}/${caseTypeId}/${caseId}/`

}

const getDocumentCreationFromURLEndpointPath = (caseInstance) =>
  caseInstance.caseType()
    .then(caseType =>
      `/documents/${caseInstance.attributes.account_id}/` +
      `${caseType.id}/${caseInstance.id}/create_from_url`
    )

const getDecumentCreationFromURLGetQuery = (downloadURL, newFilename, host, authToken) =>
  qs.stringify({
    download_url: `${host}${downloadURL}?auth_token=${authToken}`,
    file_name: newFilename
  })

const getBoundary = () => {

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const randomString = [...Array(randomStringLength).keys()].reduce((acc, position) =>
    acc + chars.charAt(Math.floor(Math.random() * chars.length))
  )

  return randomString

}

class Document {

  // Static methods

  /**
   * Creates a document from a string and attaches it to caseInstance
   * @param caseTypeId {string} The id of the case type this case belongs to
   * @param caseInstance {object} The case to attach it to
   * @param fileName {string} The name of the file
   * @param contents {string} The content of the file
   * @return {Promise.<Document>} A promise that resolves to the metadata about the saved file.
   */
  static fromString(caseTypeId, caseInstance, fileName, contents) {

    const isIntegerRepresentation = x =>
      Number.isInteger(x) || (typeof x === 'string' && !/[^0-9]+/.test(x))
    const isAlphaNumeric = x => (typeof x === 'string' && (/^[a-z0-9]+$/i).test(x))

    const validCaseTypeId = isIntegerRepresentation(caseTypeId)
    const validAccountId = isIntegerRepresentation(caseInstance.attributes.account_id)
    const validCaseId = isAlphaNumeric(caseInstance.attributes._id)

    // TODO: Implement this guard as a method decorator for all methods.
    if(!Document.Caseblocks) {

      const msg = 'You must first call Caseblocks.setup' 
      return Promise.reject(new Error(msg)) 

    } else if (!validCaseTypeId) {

      const msg = `'${caseTypeId}' is not a valid case type ID.` 
      return Promise.reject(new Error(msg)) 

    } else if (!validAccountId) {

      const msg = `'${caseInstance.account_id}' is not a valid account ID.` 
      return Promise.reject(new Error(msg)) 

    } else if (!validCaseId) {

      const msg = `'${caseInstance._id}' is not a valid case ID` 
      return Promise.reject(new Error(msg)) 

    } else {

      const documentsEndPointPath = getDocumentsEndPointPath(caseTypeId, caseInstance) 
      const uri = Document.Caseblocks.buildUrl(documentsEndPointPath) 

      const urlObject = url.parse(uri, true) 
      const boundary = getBoundary() 

      const payloadLines = [
        `--${boundary}`,
        `Content-Disposition: form-data  name="newFileName"`,
        '',
        `${fileName}`,
        `--${boundary}`,
        `Content-Disposition: form-data  name="file"  filename="${fileName}"`,
        `Content-Type: text/plain  charset=utf-8`,
        '',
        `${contents}`,
        `--${boundary}--`
      ] 


      const payload = payloadLines.join(CRLF) 
      const payloadBuffer = Buffer.from(payload) 

      const requestOptions = {
        protocol: urlObject.protocol,
        hostname: urlObject.hostname,
        path: urlObject.path,
        method: 'POST',
        headers: {
          'Content-Length': payloadBuffer.length,
          'Content-Type': `multipart/form-data  boundary="${boundary}"`,
          'Accept': '*/*',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en q=0.8',
          'auth_token': Document.Caseblocks.token
        },
      } 

      // Here the actual action begins.
      return new Promise((resolve, reject) => {

        let req = https.request(requestOptions, res => {

          const statusCode = res.statusCode 

          // Accumulate the response on an external variable.

          let respString = '' 

          res.setEncoding('utf-8') 

          res.on('data', chunk => {
            respString += chunk + '\n' 
          }) 

          res.on('end', () => {

            if (![200, 201].includes(statusCode)) {

              const msg = `The document server has returned error ${statusCode}:\n` +
                          `${respString}` 
              reject(new Error(msg)) 

            } else {

              const respBodyObject = JSON.parse(respString) 
              const document = new Document(respBodyObject, caseInstance) 
              resolve(document) 

            }
          }) 

        }) 

        // Bind the error to reject.
        req.on('error', err => {
          reject(new Error(err.message)) 
        }) 

        // Write the payload.
        req.write(payloadBuffer) 

        // Mark the request as complete.
        req.end() 

      }) 

    }

  }

  // Instance methods
  constructor(attributes, caseInstance) {

    Object.keys(attributes).forEach(key => {
      this[key] = attributes[key] 
    }) 

    this.caseInstance = caseInstance 
    this.id = attributes._id 

    this.debug = [] 

  }

  rename(newFilename) {

    if(!Document.Caseblocks) {

      throw "Must call Caseblocks.setup" 

    } else {

      this.debug.push("starting rename") 

      const url = this.url 
      const requestUrl = `${Document.Caseblocks.buildUrl(url)}&new_file_name=${newFilename}` 

      const requestOptions = {
        method: 'put',
        body: `new_file_name=${newFilename}`,
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded  charset=utf-8'
        })
      }

      return fetch(requestUrl, requestOptions)
        .then(response => response.json())
        .then(responseBody => {

          return {
            file_name: responseBody.file_name,
            url: responseBody.url
          }

        })
        .catch(err => {

          console.log(err.message) 
          throw new Error("Error renaming document") 

        }) 

    }

  }

  /**
   *
   * @param attributes Additional attribute values that will be merged
   *  with the current ones.
   * @param otherCaseInstance
   * @return {Document} The instance of the new document.
   */
  copyToCase(otherCaseInstance) {

    if (!Document.Caseblocks) {

      throw "Must call Caseblocks.setup" 

    } else {

      return getDocumentCreationFromURLEndpointPath(otherCaseInstance)
        .then(endPointPath =>

          `${Document.Caseblocks.buildUrl(endPointPath)}&` +
          getDecumentCreationFromURLGetQuery(
            this.url,
            this.file_name,
            Document.Caseblocks.host,
            Document.Caseblocks.token
          )

        ).then(endPointURL =>

          fetch(endPointURL, {
            method: 'post'
          })

        ).then(response => {

          if (response.ok) {
            return response.json()
          } else {
            const msg = `Status: ${response.status} - Message: ${response.statusText}`
            throw new Error(msg)
          }

        })
        .then(responsePayload =>

          new Document(responsePayload, otherCaseInstance)

        )

    }

  }

  delete() {

    if(!Document.Caseblocks) {

      throw "Must call Caseblocks.setup" 

    } else {

      throw("Not implemented Yet") 

    }
  }

}

module.exports = Document 
