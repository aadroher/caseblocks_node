
var should = require('chai').should(),
    caseblocks = require('../index'),
    Tasklist = require('../tasklist.js')


describe('tasklists', function() {
  it("document should find one tasklist", function(done) {
    this.timeout(5000);

    Tasklist.find("550c40d1841976debf00000a").then(function(tasklist) {
      tasklist.name.should.equal("Development Tasks")
      done();
    }).catch(function(err){
      done(err);
    })

  });
  it("document should find many tasklist", function(done) {
    this.timeout(5000);

    Tasklist.findAll(["550c40d1841976debf00000a", "550c40d1841976debf00000c", "550c40d1841976debf00000e"]).then(function(tasklists) {
      tasklists.length.should.equal(3)
      tasklists[2].name.should.equal("Admin Tasks")
      done();
    }).catch(function(err){
      done(err);
    });
  });
});
