
var should = require('chai').should(),
    Task = require('../task.js'),
    Caseblocks = require('../index')

describe('tasks', function() {

  beforeEach(function() {
    this.timeout(5000);
    Caseblocks.setup("http://localhost:8888", "tnqhvzxYaRnVt7zRWYhr")

  });

  it("should find task", function(done) {
    this.timeout(5000);

    Caseblocks.Task.get("550c40d1841976debf000004").then(function(task) {
      task.description.should.equal("Create Pull Request")
      done();
    }).catch(function(err){
      done(err);
    })

  });
  it("should find many tasklist", function(done) {
    this.timeout(5000);

    Caseblocks.Task.getAll(["550c40d1841976debf000004","550c40d1841976debf000005","550c40d1841976debf000006","550c40d1841976debf000007","550c40d1841976debf000008","550c40d1841976debf000009"]).then(function(tasks) {
      tasks.length.should.equal(6)
      tasks[2].description.should.equal("Merge in Github")
      done();
    }).catch(function(err){
      done(err);
    });
  });
  it("should execute a task", function(done) {
    this.timeout(5000);

    Caseblocks.Task.get("550c40d1841976debf000008").then(function(task) {
      task.execute().then(function(newTask) {
        newTask.status.should.equal("in_progress")
        done();
      }).catch(function(err) {
        done(err);
      });
    }).catch(function(err){
      done(err);
    })

  });

});
