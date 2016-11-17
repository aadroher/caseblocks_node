var helper = require("./helpers/spec_helper")

var should = require('chai').should(),
    Caseblocks = require('../index')

describe('casetype', function() {

  beforeEach(function() {
    Caseblocks.setup("http://test-caseblocks-location", "tnqhvzxYaRnVt7zRWYhr")

    helper.nockHttp()
  });

  describe("loading case type", function() {
    it("should have the correct id", function(done) {
      Caseblocks.Casetype.get("15").then(function(casetype) {
        casetype.id.should.equal(15)
        done();
      }).catch(function(err){
        console.error(err);
        done(err);
      });
    })
    it("should have the correct case_type_code", function(done) {
      Caseblocks.Casetype.get("15").then(function(casetype) {
        casetype.code.should.equal("website_contact")
        done();
      }).catch(function(err){
        console.error(err);
        done(err);
      });
    })
  })

  describe("finding fields", function() {
    it("should find string fields", function(done) {
      Caseblocks.Casetype.get("15").then(function(casetype) {
        fields = casetype.fieldsOfType("string")
        fields.length.should.equal(7)
        fields[0].name.should.equal("enquiry_type")
        done();
      }).catch(function(err){
        console.error(err);
        done(err);
      });
    })
    it("should find document fields", function(done) {
      Caseblocks.Casetype.get("15").then(function(casetype) {
        fields = casetype.fieldsOfType("document")
        fields.length.should.equal(1)
        fields[0].name.should.equal("enquiry_source_pdf")
        done();
      }).catch(function(err){
        console.error(err);
        done(err);
      });
    })
  })
})
