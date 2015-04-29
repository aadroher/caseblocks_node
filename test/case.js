var should = require('chai').should(),
    caseblocks = require('../index'),
    Case = require('../case.js')

describe('case', function() {
  it("document should include id", function(done) {
    this.timeout(5000);

    Case.find("support_requests", "550c40d1841976debf000003").then(function(doc) {
      doc.attributes._id.should.equal("550c40d1841976debf000003")
      done();
    }).catch(function(err){
      done(err);
    });

  });

  it("should update a document", function(done) {
    this.timeout(5000)

    Case.find("support_requests", "550c40d1841976debf000003").then(function(doc) {
      doc.attributes._id.should.equal("550c40d1841976debf000003")
      var d = new Date();
      var n = d.toUTCString();
      doc.attributes.systems_involved = n
      doc.save().then(function(doc) {
        done();
      }).catch(function(err){
        done(err);
      });

    })
  })

  it("should create a document", function(done) {
    this.timeout(5000);

    Case.create("support_requests", 42, {title: 'test1'}).then(function(doc) {
      done()
    }).catch(function(err){
      done(err);
    });

  })
})
