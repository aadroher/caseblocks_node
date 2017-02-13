const _ = require('underscore')

const helper = require("./helpers/document_tests_helper");
const chai = require('chai'),
      Caseblocks = require('../index'),
      Document = Caseblocks.Document;

const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should()

const caseBlocksBaseURL = 'https://test-caseblocks-location'

describe('document', function() {

  beforeEach(function() {
    Caseblocks.setup(caseBlocksBaseURL, "tnqhvzxYaRnVt7zRWYhr")
  })

  afterEach(function() {
    helper.nockHttp('cleanup')
  })

  describe("loading documents from cases", function() {

    it("should have the correct id", function(done) {

      helper.nockHttp('luke')

      const caseTypeName = helper.peopleCaseTypeNames

      Caseblocks.Case.get(caseTypeName.code, helper.luke._id)
        .then(lukeCase => {

          const documents = lukeCase.documents()
          documents[0].id.should.equal(helper.luke._documents[0]._id)
          done()

        })
        .catch(err => {
          console.error(err)
          done(err)
        });

    })

    it("should have the correct filename", function(done) {

      helper.nockHttp('luke')

      const caseTypeName = helper.peopleCaseTypeNames

      Caseblocks.Case.get(caseTypeName.code, helper.luke._id)
        .then(lukeCase => {

          const documents = lukeCase.documents()
          documents[0].file_name.should.equal(helper.luke._documents[0].file_name)
          done()

        })
        .catch(err => {
          console.error(err)
          done(err)
        });

    })

    it("should have the correct filename", function(done) {

      helper.nockHttp('luke')

      const caseTypeName = helper.peopleCaseTypeNames

      Caseblocks.Case.get(caseTypeName.code, helper.luke._id)
        .then(lukeCase => {

          const documents = lukeCase.documents()
          documents.length.should.equal(1)
          done()

        })
        .catch(err => {
          console.error(err)
          done(err)
        });

    })

  })

  describe("renaming documents", function() {

    // TODO: Implement this.
    it("renames document on document server")

    // TODO: Implement this.
    it("renames document fields on case")

  })

  describe('creating documents from a string', function() {

    it('should resolve into a document instance', function (done) {

      helper.nockHttp('case_type')
      helper.nockHttp('luke')

      const caseTypeName = helper.peopleCaseTypeNames
      const casePayload = helper.luke

      Caseblocks.Case.get(caseTypeName.code, casePayload._id)
        .then(caseInstance => {

          helper.nockHttp('post_vader_letter')

          Caseblocks.Document.fromString(
            helper.peopleCaseType.id.toString(),
            caseInstance,
            helper.htmlDocumentFilename,
            helper.htmlDocumentString
          ).then(document => {

            document.should.be.an.instanceOf(Document)
            done()

          }).catch(err => {

            done(err)

          })

        })
        .catch(err => {
          done(err)
        })
    })

    it('should resolve into the correct metadata object', function(done) {

      helper.nockHttp('case_type')
      helper.nockHttp('luke')

      const caseTypeName = helper.peopleCaseTypeNames
      const casePayload = helper.luke

      Caseblocks.Case.get(caseTypeName.code, casePayload._id)
        .then(caseInstance => {

          helper.nockHttp('post_vader_letter')

          Caseblocks.Document.fromString(
            helper.peopleCaseType.id.toString(),
            caseInstance,
            helper.htmlDocumentFilename,
            helper.htmlDocumentString
          ).then(document => {

            const caseTypeId = helper.peopleCaseType.id
            const documentResourcePath = `/documents/${casePayload.account_id}/${caseTypeId}/${casePayload._id}/`

            const filenameChunks = helper.htmlDocumentFilename.split('.')
            const extension = filenameChunks.length > 1 ? filenameChunks.slice(-1).pop() : ''
            const size = Buffer.byteLength(helper.htmlDocumentString, 'utf-8')

            const expected = {
              attributes: {
                content_type: 'text/html; charset=utf-8',
                extension: extension,
                file_name: helper.htmlDocumentFilename,
                pages: [],
                size: size,
                url: `${documentResourcePath}${helper.htmlDocumentFilename}`
              }
            }

            _.omit(
              document.attributes,
              'caseInstance', 'id', 'uploaded_at'
            ).should.be.deep.equal(expected.attributes)

            done()

          }).catch(err => {

            done(err)

          })

        })
        .catch(err => {
          done(err)
        })

    })

    it('should include a correct representation of the case instance', function (done) {

      helper.nockHttp('case_type')
      helper.nockHttp('luke')

      const caseTypeName = helper.peopleCaseTypeNames
      const casePayload = helper.luke

      Caseblocks.Case.get(caseTypeName.code, casePayload._id)
        .then(caseInstance => {

          helper.nockHttp('post_vader_letter')

          Caseblocks.Document.fromString(
            helper.peopleCaseType.id.toString(),
            caseInstance,
            helper.htmlDocumentFilename,
            helper.htmlDocumentString
          ).then(document => {

            document.caseInstance.should.be.deep.equal(caseInstance)
            done()

          }).catch(err => {

            done(err)

          })

        })
        .catch(err => {
          done(err)
        })

    })

    it('should raise and error if case instance is not well formed', function() {

      helper.nockHttp('post_vader_letter')

      const wrongCaseInstance = {
        attributes: {
          oh: 'my',
          this_is: 'such',
          a: 'wrong',
          argument: '!'
        }
      }

      Caseblocks.Document.fromString(
        helper.peopleCaseType.id.toString(),
        wrongCaseInstance,
        helper.htmlDocumentFilename,
        helper.htmlDocumentString
      ).should.be.rejectedWith(Error)


    })

    it('should raise and error if case type ID is not valid', function() {

      helper.nockHttp('luke')

      const caseTypeName = helper.peopleCaseTypeNames
      const casePayload = helper.luke

      const wrongCaseTypeId = '(╯°□°)╯︵ ┻━┻'

      Caseblocks.Case.get(caseTypeName.code, casePayload._id)
        .then(caseInstance => {

          helper.nockHttp('post_vader_letter')

          return Caseblocks.Document.fromString(
            wrongCaseTypeId,
            caseInstance.attributes,
            helper.htmlDocumentFilename,
            helper.htmlDocumentString
          )

        }).should.be.rejectedWith(Error)

    })

    it('should raise and error if account ID is not valid', function() {

      helper.nockHttp('luke')

      const caseTypeName = helper.peopleCaseTypeNames
      const casePayload = helper.luke

      const wrongAccountId = '(╯°□°)╯︵ ┻━┻'

      Caseblocks.Case.get(caseTypeName.code, casePayload._id)
        .then(caseInstance => {

          helper.nockHttp('post_vader_letter')

          return Caseblocks.Document.fromString(
                  helper.peopleCaseType.id.toString(),
                  Object.assign(caseInstance.attributes,{
                    account_id: wrongAccountId
                  }),
                  helper.htmlDocumentFilename,
                  helper.htmlDocumentString
                )

        }).should.be.rejectedWith(Error)

    })

    it('should raise and error if case ID is not valid', function() {

      helper.nockHttp('luke')

      const caseTypeName = helper.peopleCaseTypeNames
      const casePayload = helper.luke

      const wrongCaseId = '(╯°□°)╯︵ ┻━┻'

      Caseblocks.Case.get(caseTypeName.code, casePayload._id)
        .then(caseInstance => {

          helper.nockHttp('post_vader_letter')

          return Caseblocks.Document.fromString(
            helper.peopleCaseType.id.toString(),
            Object.assign(caseInstance.attributes,{
              _id: wrongCaseId,
            }),
            helper.htmlDocumentFilename,
            helper.htmlDocumentString
          )

        }).should.be.rejectedWith(Error)

    })

  })

  describe('copying documents from one case to another', function() {

    it('should create a new instance of Document with the same attributes', function(done) {

      helper.nockHttp('luke')

      const caseTypeName = helper.peopleCaseTypeNames

      Caseblocks.Case.get(caseTypeName.code, helper.luke._id)
        .then(lukeCase =>
          lukeCase.documents().pop()
        )
        .then(document => {

          helper.nockHttp('han')

          return Caseblocks.Case.get(caseTypeName.code, helper.han._id)
            .then(hanCase => {

              helper.nockHttp('copy_letter_from_luke_to_han')

              return document.copyToCase(hanCase)

            })
            .then(documentCopy => ({document, documentCopy}))

        })
        .then(({ document, documentCopy }) => {

          const bareDocument = _.omit(document, 'caseInstance')
          const bareDocumentCopy = _.omit(documentCopy, 'caseInstance')

          bareDocument.should.be.deep.equal(bareDocumentCopy)
          helper.han.should.be.deep.equal(
            documentCopy.caseInstance.attributes
          )
          done()

        })
        .catch(err => {
          console.log(`Error: ${err.message}`)
        })

    })

  })

})
