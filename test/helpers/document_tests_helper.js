const nock = require("nock");
const chai = require("chai");
const fs = require("fs");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

// Constants

const casePayloadPath = './test/support/case.json'

const htmlDocumentFilename = 'example.html'
const htmlDocumentPath = `./test/support/${htmlDocumentFilename}`

const caseTypeName = {
  sing: 'pirate',
  plu: 'pirates'
}

const casePayload = JSON.parse(
  fs.readFileSync(casePayloadPath, 'utf-8')
)

const accountId = casePayload.account_id
const caseTypeId = casePayload.case_type_id
const caseId = casePayload._id


const documentResourcePath = caseId => `/documents/${accountId}/${caseTypeId}/${caseId}/`
const caseResourcePath = caseId => `/case_blocks/${caseTypeName.plu}/${caseId}.json`

const authQuery = {
  auth_token: 'tnqhvzxYaRnVt7zRWYhr'
}

const caseBlocksBaseURL = 'https://test-caseblocks-location'

const htmlDocumentString = fs.readFileSync(htmlDocumentPath, 'utf-8')


// Utility functions to process the multpipart/form-data POST
// request.

const processDocumentPostRequest = (request, body) => {

  const headers = request.headers
  const contentTypeHeader = getContentTypeHeader(headers, 'content-type')

  const isMultipart = contentTypeHeader.mediaType === 'multipart/form-data'

  if (isMultipart) {

    try {

      const payload = parseMultipartPayload(contentTypeHeader, body)
      const validation = getPayloadValidation(payload)

      if (validation.validates) {

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

const getPayloadValidation = multipartPayload => ({
  validates: true,
  messages: ''
})

// Validation rules.

const hasTheRightFormFieldName = payload => {
  const part = payload.find(part =>
    part.preamble['Content-Disposition'].directiveFields.name === 'newFileName'
  )
  return !!part
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
      url: `${documentResourcePath(caseId)}${fileName}`
    }

  }

}


const nockHttp = () => {

  // Documents

  nock(caseBlocksBaseURL, {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/support_requests/case-with-documents.json')
    .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, {
      "support_request": {
        _id: 'case-with-documents', systems_involved: '1', "_documents": [{
          "content_type": "application/pdf",
          "size": "2952201",
          "extension": "pdf",
          "uploaded_at": "2016-05-17T10:49:37.179Z",
          "pages": [{
            "page_no": 1,
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-0.jpg?ignoreOnTimeline=true"
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-1.jpg?ignoreOnTimeline=true",
            "page_no": 2
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-2.jpg?ignoreOnTimeline=true",
            "page_no": 3
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-3.jpg?ignoreOnTimeline=true",
            "page_no": 4
          }, {
            "page_no": 5,
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-4.jpg?ignoreOnTimeline=true"
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-5.jpg?ignoreOnTimeline=true",
            "page_no": 6
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-6.jpg?ignoreOnTimeline=true",
            "page_no": 7
          }],
          "_id": "573af74181e9a82979000008",
          "file_name": "old-filename.pdf",
          "url": "/documents/2/22/573af72681e9a8296f000023/old-filename.pdf"
        }],
        "application_pdf": {
          "file_name": "old-filename.pdf",
          "url": "/documents/2/22/573af72681e9a8296f000023/old-filename.pdf",
          "content_type": "application/pdf",
          "size": "2952201",
          "extension": "pdf",
          "uploaded_at": "2016-05-17T10:49:37.179Z",
          "used_as_attachment": false,
          "pages": [{
            "page_no": 1,
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-0.jpg?ignoreOnTimeline=true"
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-1.jpg?ignoreOnTimeline=true",
            "page_no": 2
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-2.jpg?ignoreOnTimeline=true",
            "page_no": 3
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-3.jpg?ignoreOnTimeline=true",
            "page_no": 4
          }, {
            "page_no": 5,
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-4.jpg?ignoreOnTimeline=true"
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-5.jpg?ignoreOnTimeline=true",
            "page_no": 6
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-6.jpg?ignoreOnTimeline=true",
            "page_no": 7
          }],
          "status": null,

        },
        "work_type_id": 22
      }
    });

  nock(caseBlocksBaseURL)
    .put('/documents/2/22/573af72681e9a8296f000023/old-filename.pdf', "new_file_name=new-filename.pdf")
    .query({new_file_name: "new-filename.pdf", auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, "{\"file_name\":\"new-filename.pdf\",\"url\":\"/documents/2/22/573af72681e9a8296f000023/new-filename.pdf\"}");

  nock(caseBlocksBaseURL, {reqheaders: {'accept': 'application/json'}})
    .put('/case_blocks/support_requests/case-with-documents.json', {
      "support_request": {
        "_id": "case-with-documents",
        "systems_involved": "1",
        "application_pdf": {
          "file_name": "new-filename.pdf",
          "url": "/documents/2/22/573af72681e9a8296f000023/new-filename.pdf",
          "content_type": "application/pdf",
          "size": "2952201",
          "extension": "pdf",
          "uploaded_at": "2016-05-17T10:49:37.179Z",
          "used_as_attachment": false,
          "pages": [{
            "page_no": 1,
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-0.jpg?ignoreOnTimeline=true"
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-1.jpg?ignoreOnTimeline=true",
            "page_no": 2
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-2.jpg?ignoreOnTimeline=true",
            "page_no": 3
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-3.jpg?ignoreOnTimeline=true",
            "page_no": 4
          }, {
            "page_no": 5,
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-4.jpg?ignoreOnTimeline=true"
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-5.jpg?ignoreOnTimeline=true",
            "page_no": 6
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-6.jpg?ignoreOnTimeline=true",
            "page_no": 7
          }],
          "status": null
        },
        "work_type_id": 22
      }
    })
    .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, {
      "support_request": {
        _id: '550c40d9841976debf000011',
        systems_involved: "2",
        calculated_field1: "calculated-result1",
        calculated_field2: "calculated-result2"
      }
    });

  nock(caseBlocksBaseURL, {reqheaders: {'accept': 'application/json'}})
    .get(caseResourcePath(caseId))
    .query(authQuery)
    .reply(200, {
      [caseTypeName.sing]: casePayload
    })

  /**
   * Respond with 200 + payload if OK or 400 + error message otherwise.
   */
  nock(caseBlocksBaseURL)
    .post(documentResourcePath(caseId))
    .query(authQuery)
    .reply(function (uri, requestBody) {
      return processDocumentPostRequest(this.req, requestBody)
    })

}


module.exports = {
  nockHttp,
  authQuery,
  caseTypeName,
  casePayload,
  htmlDocumentFilename,
  htmlDocumentString,
  expect: chai.expect
}

