const helper = require("./spec_helper");
const should = require('chai').should(),
      Caseblocks = require('../index');

const Document = require('../document').Document;

describe('document', function() {

  beforeEach(function() {
    Caseblocks.setup("http://test-caseblocks-location", "tnqhvzxYaRnVt7zRWYhr")

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

    it("renames document fields on case")

  })

  describe('creating documents from a string', () => {

    it('should resolve into a document instance', () => {

      const caseTypeName = helper.caseTypeName
      const casePayload = helper.casePayload

      Caseblocks.Case.get(caseTypeName.plu, casePayload._id)
        .then(caseInstance =>
          Caseblocks.Document.fromString(
            casePayload.account_id,
            casePayload.case_type_id,
            'example.html',
            helper.htmlDocumentString
          ).then(doc =>
            doc.should.be.a('Document')
          )
        )

      // return Promise.resolve(1).should.eventually.equal(1)

      // return Caseblocks.Document.fromString('1', {id: 'hfks'}, 'file_name.html', '<p>Hello!</p>>')
      //         .should.equal(false)
    })
  })
})
