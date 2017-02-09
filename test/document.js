const _ = require('underscore')

const helper = require("./helpers/document_tests_helper");
const chai = require('chai'),
      Caseblocks = require('../index'),
      Document = Caseblocks.Document;

const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should()

const caseBlocksBaseURL = 'https://test-caseblocks-location'

describe.only('document', function() {

  beforeEach(function() {
    Caseblocks.setup(caseBlocksBaseURL, "tnqhvzxYaRnVt7zRWYhr")

    helper.nockHttp()
  });

  describe("loading documents from cases", function() {

    it("should have the correct id", function(done) {
      Caseblocks.Case.get("support_requests", "case-with-documents").then(function(kase) {
        docs = kase.documents()
        docs[0].id.should.equal("573af74181e9a82979000008")
        done();
      }).catch(function(err){
        console.error(err);
        done(err);
      });

    })

    it("should have the correct filename", function(done) {
      Caseblocks.Case.get("support_requests", "case-with-documents").then(function(kase) {
        docs = kase.documents()
        docs[0].id.should.equal("573af74181e9a82979000008")
        done();
      }).catch(function(err){
        console.error(err);
        done(err);
      });
    })

    it("should have the correct filename", function(done) {
      Caseblocks.Case.get("support_requests", "case-with-documents").then(function(kase) {
        docs = kase.documents()
        docs[0].caseInstance.should.equal(kase)
        done();
      }).catch(function(err){
        console.error(err);
        done(err);
      });
    })

    it("should load all documents", function(done) {
      Caseblocks.Case.get("support_requests", "case-with-documents").then(function(kase) {
        docs = kase.documents()
        docs.length.should.equal(1)
        done();
      }).catch(function(err){
        console.error(err);
        done(err);
      });
    })

  })

  describe("renaming documents", function() {

    it("renames document on document server", function(done) {
      Caseblocks.Case.get("support_requests", "case-with-documents").then(function(kase) {
        docs = kase.documents()
        docs[0].rename("new-filename.pdf").then(function(doc) {
          doc.file_name.should.equal("new-filename.pdf")
          done();
        }).catch(function(err){
          done(err);
        })
      }).catch(function(err){
        done(err);
      })
    })

    // TODO: Implement this.
    it("renames document fields on case")

  })

  describe('creating documents from a string', function() {

    it('should resolve into a document instance', function (done) {

      const caseTypeName = helper.caseTypeName
      const casePayload = helper.casePayload

      Caseblocks.Case.get(caseTypeName.plu, casePayload._id)
        .then(caseInstance => {

          Caseblocks.Document.fromString(
            caseInstance.attributes.case_type_id,
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

      const caseTypeName = helper.caseTypeName
      const casePayload = helper.casePayload

      Caseblocks.Case.get(caseTypeName.plu, casePayload._id)
        .then(caseInstance => {

          Caseblocks.Document.fromString(
            caseInstance.attributes.case_type_id.toString(),
            caseInstance,
            helper.htmlDocumentFilename,
            helper.htmlDocumentString
          ).then(document => {

            const caseTypeId = caseInstance.attributes.case_type_id
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

      const caseTypeName = helper.caseTypeName
      const casePayload = helper.casePayload

      Caseblocks.Case.get(caseTypeName.plu, casePayload._id)
        .then(caseInstance => {

          Caseblocks.Document.fromString(
            caseInstance.attributes.case_type_id,
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

      const caseTypeName = helper.caseTypeName
      const casePayload = helper.casePayload

      const wrongCaseInstance = {
        attributes: {
          oh: 'my',
          this_is: 'such',
          a: 'wrong',
          argument: '!'
        }
      }


      Caseblocks.Document.fromString(
        casePayload.case_type_id,
        wrongCaseInstance,
        helper.htmlDocumentFilename,
        helper.htmlDocumentString
      ).should.be.rejectedWith(Error)


    })

    it('should raise and error if case type ID is not valid', function() {

      const caseTypeName = helper.caseTypeName
      const casePayload = helper.casePayload

      const wrongCaseTypeId = '(╯°□°)╯︵ ┻━┻'

      return Caseblocks.Case.get(caseTypeName.plu, casePayload._id)
        .then(caseInstance => {

          return Caseblocks.Document.fromString(
            wrongCaseTypeId,
            caseInstance.attributes,
            helper.htmlDocumentFilename,
            helper.htmlDocumentString
          )

        }).should.be.rejectedWith(Error)

    })

    it('should raise and error if account ID is not valid', function() {

      const caseTypeName = helper.caseTypeName
      const casePayload = helper.casePayload

      const wrongAccountId = '(╯°□°)╯︵ ┻━┻'

      return Caseblocks.Case.get(caseTypeName.plu, casePayload._id)
        .then(caseInstance => {
          return Caseblocks.Document.fromString(
                  caseInstance.attributes.case_type_id,
                  Object.assign(caseInstance.attributes,{
                    account_id: wrongAccountId
                  }),
                  helper.htmlDocumentFilename,
                  helper.htmlDocumentString
                )
        }).should.be.rejectedWith(Error)

    })

    it('should raise and error if case ID is not valid', function() {

      const caseTypeName = helper.caseTypeName
      const casePayload = helper.casePayload

      const wrongCaseId = '(╯°□°)╯︵ ┻━┻'

      return Caseblocks.Case.get(caseTypeName.plu, casePayload._id)
        .then(caseInstance => {

            return Caseblocks.Document.fromString(
              caseInstance.attributes.case_type_id,
              Object.assign(caseInstance.attributes,{
                _id: wrongCaseId,
              }),
              helper.htmlDocumentFilename,
              helper.htmlDocumentString
            )

        }).should.be.rejectedWith(Error)

    })

  })


  describe.only('copying documents from one case to another one', function(done) {




  })

})
