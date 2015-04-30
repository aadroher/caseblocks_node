var should = require('chai').should(),
    Caseblocks = require('../index')


describe('case', function() {

  beforeEach(function() {
    this.timeout(5000);
    Caseblocks.setup("http://localhost:8888", "tnqhvzxYaRnVt7zRWYhr")

  });

  it("document should include id", function(done) {
    Caseblocks.Case.get("support_requests", "550c40d1841976debf000003").then(function(doc) {
      doc.attributes._id.should.equal("550c40d1841976debf000003")
      done();
    }).catch(function(err){
      done(err);
    });
  });

  it("should update a document", function(done) {
    Caseblocks.Case.get("support_requests", "550c40d1841976debf000003").then(function(doc) {
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
    Caseblocks.Case.create("support_requests", 42, {title: 'test1'}).then(function(doc) {
      done()
    }).catch(function(err){
      done(err);
    });

  })

  it("should search for a document", function(done) {
    Caseblocks.Case.search(42, 'test1').then(function(docs) {
      docs.length.should.to.be.above(1)
      docs[0].attributes.title.should.equal("test1")
      done()
    }).catch(function(err){
      done(err);
    });

  })

  it ("should find related documents", function(done) {
    var case_id = "5319b0ea841976d9c000007f"

    done()

  })

  // it("should delete a document", function(done) {
  //   Case.create("support_requests", 42, {title: 'test1'}).then(function(doc) {
  //     done()
  //   }).catch(function(err){
  //     done(err);
  //   });
  //
  // })

})
