var helper = require("./spec_helper")
var should = require('chai').should(),
    Caseblocks = require('../index')

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
        docs[0].kase.should.equal(kase)
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
})
