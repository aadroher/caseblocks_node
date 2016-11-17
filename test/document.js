const _ = require('underscore')

const helper = require("./helpers/document_tests_helper");
const should = require('chai').should(),
      Caseblocks = require('../index'),
      Document = Caseblocks.Document;

const caseBlocksBaseURL = 'https://test-caseblocks-location'

describe('document', function() {

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
      }).fail(function(err){
        console.error(err);
        done(err);
      });
    })

    it("should have the correct filename", function(done) {
      Caseblocks.Case.get("support_requests", "case-with-documents").then(function(kase) {
        docs = kase.documents()
        docs[0].caseInstance.should.equal(kase)
        done();
      }).fail(function(err){
        console.error(err);
        done(err);
      });
    })

    it("should load all documents", function(done) {
      Caseblocks.Case.get("support_requests", "case-with-documents").then(function(kase) {
        docs = kase.documents()
        docs.length.should.equal(1)
        done();
      }).fail(function(err){
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
        }).fail(function(err){
          done(err);
        })
      }).fail(function(err){
        done(err);
      })
    })

    // TODO: Implement this.
    it("renames document fields on case")

  })

  describe('creating documents from a string', function() {

    it('should resolve into a correct document instance', function (done) {

      const caseTypeName = helper.caseTypeName
      const casePayload = helper.casePayload

      Caseblocks.Case.get(caseTypeName.plu, casePayload._id)
        .then(caseInstance => {

          Caseblocks.Document.fromString(
            caseInstance.attributes.case_type_id,
            caseInstance.attributes,
            helper.htmlDocumentFilename,
            helper.htmlDocumentString
          ).then(document => {

            document.should.be.an.instanceOf(Document)
            document.caseInstance.should.be.deep.equal(caseInstance.attributes)

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
            caseInstance.attributes.case_type_id,
            caseInstance.attributes,
            helper.htmlDocumentFilename,
            helper.htmlDocumentString
          ).then(document => {

            const caseTypeId = caseInstance.attributes.case_type_id
            const documentResourcePath = `/documents/${casePayload.account_id}/${caseTypeId}/${casePayload._id}/`

            const filenameChunks = helper.htmlDocumentFilename.split('.')
            const extension = filenameChunks.length > 1 ? filenameChunks.slice(-1).pop() : ''
            const size = Buffer.byteLength(helper.htmlDocumentString, 'utf-8')

            const expected = {
              content_type: 'text/html; charset=utf-8',
              extension: extension,
              file_name: helper.htmlDocumentFilename,
              pages: [],
              size: size,
              url: `${documentResourcePath}${helper.htmlDocumentFilename}`
            }

            _.omit(
              document,
              'caseInstance', 'uploaded_at', 'id', '_id', 'debug'
            ).should.be.deep.equal(expected)

            done()

          }).catch(err => {

            done(err)

          })

        })
        .catch(err => {
          done(err)
        })

    })

    it('should be awesome')

  })
})
