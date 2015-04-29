
var should = require('chai').should(),
    caseblocks = require('../index'),
    Tasklist = require('../tasklist.js')


describe('tasklists', function() {
  it("document should find one tasklist", function(done) {
    this.timeout(5000);

    Tasklist.find("5540a4b28419761f4000009e").then(function(tasklist) {
      tasklist.name.should.equal("Development Tasks")
      done();
    }).catch(function(err){
      done(err);
    })

  });
  it("document should find many tasklist", function(done) {
    this.timeout(5000);

    Tasklist.findAll(["5540a4b28419761f4000009e", "5540a4b28419761f400000a0", "5540a4b28419761f400000a2"]).then(function(tasklists) {
      tasklists.length.should.equal(3)
      tasklists[2].name.should.equal("Admin Tasks")
      done();
    }).catch(function(err){
      done(err);
    });
  });
});
