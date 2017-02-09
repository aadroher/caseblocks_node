const nock = require('nock')
const chai = require('chai')
const fs = require('fs')
const chaiAsPromised = require('chai-as-promised')
const _ = require('underscore')

const {
  caseTypes,
  people
} = require('./collections')

chai.use(chaiAsPromised);

// Constants
const caseBlocksBaseURL = 'https://test-caseblocks-location'

const authToken = 'tnqhvzxYaRnVt7zRWYhr'

const htmlDocumentFilename = 'example.html'
const htmlDocumentPath = `./test/support/${htmlDocumentFilename}`

const peopleCaseType = caseTypes[0]
const peopleCaseTypeNames = {
  name: peopleCaseType.name,
  code: peopleCaseType.code
}

const han = people[0]
const luke = people[1]
const letterFromAnakinDocument = luke._documents[0]

const accountId = luke.account_id
const caseTypeId = peopleCaseType.id
const lukeCaseId = luke._id
const hanCaseId = han._id

const caseDocumentsFolderPath = caseId => `/documents/${accountId}/${caseTypeId}/${caseId}/`
const documentCreationByURLPath = caseId => `/documents/${accountId}/${caseTypeId}/${caseId}/create_from_url`

const caseResourcePath = caseId => `/case_blocks/${peopleCaseTypeNames.code}/${caseId}.json`
const personCaseTypeResourcePath = caseTypeId => `/case_blocks/case_types/${caseTypeId}.json`


const authQuery = {
  auth_token: authToken
}

const documentCreationByURLQuery = (caseId, fileName) => ({
  download_url: `${caseBlocksBaseURL}${caseDocumentsFolderPath(caseId)}${fileName}?auth_token=${authToken}`,
  file_name: fileName
})

const htmlDocumentString = fs.readFileSync(htmlDocumentPath, 'utf-8')


// Utility functions to process the multpipart/form-data POST
// request.
const processDocumentFormPostRequest = (request, body) => {

  const headers = request.headers
  const contentTypeHeader = getContentTypeHeader(headers, 'content-type')

  const isMultipart = contentTypeHeader.mediaType === 'multipart/form-data'

  if (isMultipart) {

    try {

      const payload = parseMultipartPayload(contentTypeHeader, body)
      const valid = getPayloadValidation(payload)

      if (valid) {

        return [200,
          getResponsePayload({
            contentType: 'text/html; charset=utf-8',
            fileName: htmlDocumentFilename,
            fileContents: htmlDocumentString
          })
        ]

      } else {

        const msg = 'The payload is not valid.'
        return [400, msg]

      }

    } catch (err) {

      return [400, err.message]

    }

  } else {

    const msg = 'The payload is not well formed.'
    return [400, msg]

  }

}

const getContentTypeHeader = (headers, name) => {

  const contentTypeDirectives = headers[name].split(';')

  const contentTypeHeader = contentTypeDirectives.reduce((prevVal, directive, index) => {

    const directiveChunks = index === 0 ? ['mediaType', directive] : directive.split('=')
    const cleanDirectiveChunks = directiveChunks.map(
      chunk => chunk.trim().replace(/['"]+/g, '')
    )

    return Object.assign(prevVal, {
      [cleanDirectiveChunks[0]]: cleanDirectiveChunks[1]
    })

  }, {})

  return contentTypeHeader

}

const parseMultipartPayload = (contenTypeHeader, body) => {

  const separator = `--${contenTypeHeader.boundary}`

  const chunks = body.split(separator)

  const isWellFormed = chunks.slice(0, 1).pop() === '' && chunks.slice(-1).pop() === '--'

  if (isWellFormed) {

    const parts = chunks.slice(1, -1).map(parsePart)
    return parts

  } else {

    const msg = `The received multipart payload is not well formed.`
    throw new Error(msg)

  }

}

const parsePart = (chunk, index) => {

  const lineSep = '\r\n'
  const chunkTree = chunk.trim()
    .split(`${lineSep}${lineSep}`)
    .map(
      subpart => subpart.split(lineSep)
    )

  const isWellFormed = chunkTree.length === 2
    && chunkTree.every((subchunk, subindex) =>
      Array.isArray(subchunk)
      && (subindex !== 1 || subchunk.length === 1)
    )

  if (isWellFormed) {

    const preambleChunks = chunkTree[0]
    const preambleHeaders = preambleChunks.map(preambleChunk => {

      const headerChunks = preambleChunk.split(/: +/)

      const headerName = headerChunks.slice(0, 1).pop()
      const headerFields = headerChunks.slice(1, 2).pop().split(/; +/)
      const directiveName = headerFields.slice(0, 1).pop()
      const directiveFields = headerFields.slice(1).map(headerField => {

        const headerFieldChunks = headerField.split('=')

        const attrAndVal = headerFieldChunks.map(headerFieldChunk =>
          headerFieldChunk.replace(/['"]+/g, '')
        )

        return {
          [attrAndVal[0]]: attrAndVal[1]
        }

      }).reduce((prevVal, entry) =>
          Object.assign(prevVal, entry)
        , {})

      return {
        headerName, directiveName, directiveFields
      }

    })

    const preamble = preambleHeaders.reduce((prevVal, header) =>
        Object.assign(prevVal, {
          [header.headerName]: {
            directiveName: header.directiveName,
            directiveFields: header.directiveFields
          }
        })
      , {})

    return {
      preamble,
      body: chunkTree.pop().pop()
    }

  } else {

    const msg = `Part ${index} from the received multipart payload is not well formed.`
    throw Error(msg)

  }

}

const getPayloadValidation = multipartPayload =>
  [
    hasTheRightFormFieldName,
    formDataIsTextPlain
  ].every(condition => condition(multipartPayload))


// Validation rules.
const hasTheRightFormFieldName = payload => {
  const part = payload.find(part =>
    part.preamble['Content-Disposition'].directiveFields.name === 'newFileName'
  )
  return !!part
}

const formDataIsTextPlain = payload => {

  const part = payload.find(part =>
    _.isEqual(part.preamble['Content-Disposition'].directiveFields, {
      name: 'file',
      filename: 'example.html'
    })
  )

  return !!part && _.isEqual(part.preamble['Content-Type'], {
      directiveName: 'text/plain',
      directiveFields: { charset: 'utf-8' }
    })

}


const getResponsePayload = ({contentType, fileName, fileContents}) => {

  const filenameChunks = fileName.split('.')
  const extension = filenameChunks.length > 1 ? filenameChunks.slice(-1).pop() : ''
  const size = Buffer.byteLength(fileContents, 'utf-8')

  const randomId = (Math.floor(Math.random() * Math.pow(10, 28))).toString(16)

  return {

    _id: randomId,
    attributes: {
      id: randomId,
      content_type: contentType,
      extension: extension,
      file_name: fileName,
      pages: [],
      size: size,
      uploaded_at: new Date().toISOString(),
      url: `${caseDocumentsFolderPath(lukeCaseId)}${fileName}`
    }

  }

}


const nockHttp = action => {

  switch(action) {
    case 'case_type':
      // Case Types
      nock(caseBlocksBaseURL)
        .get(personCaseTypeResourcePath(peopleCaseType.id))
        .query(authQuery)
        .reply(200, {
          case_type: peopleCaseType
        })
      break

    case 'luke':
      nock(caseBlocksBaseURL)
        .get(caseResourcePath(lukeCaseId))
        .query(authQuery)
        .reply(200, {
          [peopleCaseTypeNames.code]: luke
        })
      break

    case 'han':
      nock(caseBlocksBaseURL)
        .get(caseResourcePath(hanCaseId))
        .query(authQuery)
        .reply(200, {
          [peopleCaseTypeNames.code]: han
        })
      break

    case 'post_vader_letter':
      /**
       * Respond with 200 + payload if OK or 400 + error message otherwise.
       */
      nock(caseBlocksBaseURL)
        .post(caseDocumentsFolderPath(lukeCaseId))
        .query(authQuery)
        .reply(function (uri, requestBody) {
          return processDocumentFormPostRequest(this.req, requestBody)
        })
      break

    case 'copy_letter_from_luke_to_han':
      nockHttp('case_type')
      nock(caseBlocksBaseURL)
        .post(documentCreationByURLPath(hanCaseId))
        .query(receivedQuery =>
          Object.assign(
            authQuery,
            documentCreationByURLQuery(lukeCaseId, letterFromAnakinDocument.file_name)
          )
        )
        .reply(200, letterFromAnakinDocument)
      break

    case 'cleanup':
    default:
      nock.cleanAll()
  }

}



module.exports = {
  nockHttp,
  authQuery,
  peopleCaseType,
  peopleCaseTypeNames,
  luke,
  han,
  htmlDocumentFilename,
  htmlDocumentString,
  expect: chai.expect
}

