
var should = require('chai').should(),
    caseblocks = require('../index'),
    Task = require('../task.js')


describe('tasks', function() {
  it("document should find task", function(done) {
    this.timeout(5000);

    Task.find("5540a4b28419761f40000098").then(function(task) {
      task.description.should.equal("Create Pull Request")
      done();
    }).catch(function(err){
      done(err);
    })

  });
  it("document should find many tasklist", function(done) {
    this.timeout(5000);

    Task.findAll(["5540a4b28419761f40000098","5540a4b28419761f40000099","5540a4b28419761f4000009a","5540a4b28419761f4000009b","5540a4b28419761f4000009c","5540a4b28419761f4000009d"]).then(function(tasks) {
      tasks.length.should.equal(6)
      tasks[2].description.should.equal("Merge in Github")
      done();
    }).catch(function(err){
      done(err);
    });
  });
});
