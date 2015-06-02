
var should = require('chai').should(),
    Tasklist = require('../tasklist.js'),
    Caseblocks = require('../index')

describe('tasklists', function() {

  beforeEach(function() {
    this.timeout(5000);
    Caseblocks.setup("http://localhost:8888", "tnqhvzxYaRnVt7zRWYhr")

  });

  it("document should find one tasklist", function(done) {

    Caseblocks.Tasklist.get("550c40d9841976debf000018").then(function(tasklist) {
      tasklist.name.should.equal("Development Tasks")
      done();
    }).catch(function(err){
      done(err);
    })

  });
  it("document should find many tasklist", function(done) {

    Caseblocks.Tasklist.getAll(["550c40d9841976debf000018", "550c40d9841976debf00001a", "550c40d9841976debf00001c"]).then(function(tasklists) {
      tasklists.length.should.equal(3)
      tasklists[2].name.should.equal("Admin Tasks")
      done();
    }).catch(function(err){
      done(err);
    });
  });
});
