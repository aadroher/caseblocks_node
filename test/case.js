var helper = require("./spec_helper")

var should = require('chai').should(),
    Caseblocks = require('../index')

describe('case', function() {

  beforeEach(function() {
    Caseblocks.setup("http://test-caseblocks-location", "tnqhvzxYaRnVt7zRWYhr")

    helper.nockHttp()
  });

  it("document should include id", function(done) {
    Caseblocks.Case.get("support_requests", "550c40d9841976debf000011").then(function(doc) {
      doc.attributes._id.should.equal("550c40d9841976debf000011")
      done();
    }).catch(function(err){
      console.log(err);
      done(err);
    });
  });

  it("should update a document", function(done) {
    this.timeout(5000);
    Caseblocks.Case.get("support_requests", "550c40d9841976debf000011").then(function(doc) {
      doc.attributes._id.should.equal("550c40d9841976debf000011")
      doc.attributes.systems_involved.should.equal("1")
      doc.attributes.systems_involved = "2"
      doc.save().then(function(doc2) {
        doc2.attributes.systems_involved.should.equal("2")
        done();
      }).catch(function(err){
        done(err);
      });
    }).catch(function(err){
      done(err);
    });
  })

  it("should create a document", function(done) {
    Caseblocks.Case.create("support_requests", 42, {title: 'test1'}).then(function(doc) {
      done()
    }).catch(function(err){
      done(err);
    });

  })

  it("should search for a document and return match", function(done) {
    Caseblocks.Case.search(42, 'match-result').then(function(docs) {
      docs.length.should.to.be.above(1)
      docs[0].attributes.title.should.equal("test1")
      done()
    }).catch(function(err){
      done(err);
    });

  })

  it("should search for a document and return no matches", function(done) {
    Caseblocks.Case.search(42, 'no-match-result').then(function(docs) {
      docs.length.should.equal(0)
      done()
    }).catch(function(err){
      done(err);
    });

  })

  it ("should find related documents", function(done) {
    var case_id = "54524f696b949172a7000001"
    Caseblocks.Case.get("customers", "54524f696b949172a7000001").then(function(doc) {
      doc.related("web_enquiries", 28).then(function(related_docs) {
        related_docs.length.should.equal(1);
        related_docs[0].id.should.equal("554379ab841976f73700011c");
        done()
      }).catch(function(err) {
        done(err);
      })
    }).catch(function(err) {
      done(err);
    })

  })

})
