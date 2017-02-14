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


const getDocumentsEndPointPath = caseInstance =>
  caseInstance.caseType()
    .then(caseType =>
      `/documents/${caseInstance.attributes.account_id}/` +
      `${caseType.id}/${caseInstance.id}/`
    )

const getFormBoundary = () => {

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

      const documentsEndPointPathPromise = getDocumentsEndPointPath(caseInstance)

      return documentsEndPointPathPromise
        .then(documentsEndPointPath => {

          const uri = Document.Caseblocks.buildUrl(documentsEndPointPath)

          const urlObject = url.parse(uri, true)
          const boundary = getFormBoundary()

          const payloadLines = [
            `--${boundary}`,
            `Content-Disposition: form-data;  name="newFileName"`,
            '',
            `${fileName}`,
            `--${boundary}`,
            `Content-Disposition: form-data;  name="file";  filename="${fileName}"`,
            `Content-Type: text/plain;  charset=utf-8`,
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
              'Content-Type': `multipart/form-data;  boundary="${boundary}"`,
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
   * Creates a copy of the file represented by this instance of Document in the right
   * folder of the documents server and creates its corresponding Document instance
   * assiged to `otherCaseInstance`.
   * @param {Case} otherCaseInstance The case the copy of the document should be assigned to.
   * @param {object} options a plain object whose attributes modify the operations of this function:
   *  - `{string} targetFilename` The name the file copied should have in the destination case folder.
   *    Its default value is the name of the source file (`this.file_name`). It should include the file name extension.
   *  - `{boolean} overwriteOnFound` `true` if the file contents of a destination file with the same
   *    name are to be overwritten by the ones of the document being copied. Its default value is `false`.
   * @return {Promise.<Document>} A promise that resolves into the instance of the new instance of `Document`
   *  attached to `caseInstance`, whose file contents are a copy of the ones found in `this`.
   *  The promise is rejected if an error occurred at any of the stages of the operation it implements
   *  or if `caseInstance.documents().some(d => d.file_name === options.targetFilename)`
   *  and `options.overwriteOnFound === false`.
   */
  copyToCase(otherCaseInstance, options={}) {

    const optionDefaults = {
      targetFileName: this.file_name,
      overwriteOnFound: false
    }
    const finalOptions = Object.assign(optionDefaults, options)

    if (!Document.Caseblocks) {

      throw "Must call Caseblocks.setup"

    } else {

      // First check if a file with the same name exists.
      const documentExists = otherCaseInstance.hasDocumentWithFile(finalOptions.targetFileName)

      if (documentExists && !finalOptions.overwriteOnFound) {

        const msg = `Document with filename "${this.file_name}" already exists in case `
          + `"${otherCaseInstance.attributes.title}".\n`
          + 'If you want to overwrite the file please set the `overwriteOnFound` option to `true`.'

        return Promise.reject(new Error(msg))

      } else if (documentExists && finalOptions.overwriteOnFound) {

        // The SDK will behave exactly as the Webclient does. Delete the file and create it anew.
        const existingDocument = otherCaseInstance.getDocumentWithFilename(finalOptions.targetFileName)

        return existingDocument.delete()
          .then(deleted =>
            this._createFromURL(otherCaseInstance, finalOptions)
          )

      } else {
        return this._createFromURL(otherCaseInstance, finalOptions)
      }
    }
  }

  // TODO: Find another verb that is not a reserved keyword, such as `destroy`.
  /**
   * Deletes both de document instance and the file in the server it represents.
   * @return {Promise.<boolean>} A promise that resolves into `True` if and only if the document instance
   *  has been successfully deleted.
   * @throws {Error} When the deletion was not successful.
   */
  ['delete']() {

    if(!Document.Caseblocks) {

      throw new Error("Must call Caseblocks.setup")

    } else {

      const deletionEndPointPathPromise = getDocumentsEndPointPath(this.caseInstance)
        .then(documentsEnpointPath =>
          `${documentsEnpointPath}${this.file_name}`
        )

      return deletionEndPointPathPromise
        .then(deletionEndPointPath =>
          Document.Caseblocks.buildUrl(deletionEndPointPath)
        )
        .then(deletionURL =>
          fetch(deletionURL, {
            method: 'delete',
          })
        )
        .then(response => {

          if (response.ok) {
            return true
          } else {
            const msg = `Document with filename "${this.file_name}" on "${this.caseInstance.attributes.title}" `
                      + 'could not be renamed.'
            throw new Error(msg)
          }

        })

    }
  }


  // #################
  // "Private" methods
  // #################

  _createFromURL(caseInstance, options) {

    const endPointPathPromise = getDocumentsEndPointPath(caseInstance)
      .then(documentsEnpointPath =>
        `${documentsEnpointPath}create_from_url`
      )

    const getQuery = qs.stringify({
      download_url: `${Document.Caseblocks.host}${this.url}?auth_token=${Document.Caseblocks.token}`,
      file_name: options.targetFileName
    })

    return endPointPathPromise
      .then(endPointPath =>
        `${Document.Caseblocks.buildUrl(endPointPath)}&${getQuery}`
      )
      .then(endPointURL =>
        fetch(endPointURL, {
          method: 'post',
          headers: {
            'content-type': 'application/json'
          }
        })
      )
      .then(response => {

        if (response.ok) {
          return response.json()
        } else {
          const msg = `Status: ${response.status} - Message: ${response.statusText}`
          throw new Error(msg)
        }

      })
      .then(responsePayload =>
        new Document(responsePayload, caseInstance)
      )

  }

}

module.exports = Document 
