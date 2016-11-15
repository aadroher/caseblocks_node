var helper = require("./helpers/spec_helper")

var should = require('chai').should(),
    Task = require('../task.js'),
    Caseblocks = require('../index')

describe('tasks', function() {

  beforeEach(function() {
    this.timeout(5000);
    Caseblocks.setup("http://test-caseblocks-location", "tnqhvzxYaRnVt7zRWYhr")

    helper.nockHttp()

  });

  it("should find a task", function(done) {
    this.timeout(5000);

    Caseblocks.Task.get("550c40d9841976debf000012").then(function(task) {
      task.description.should.equal("Create Pull Request")
      done();
    }).catch(function(err){
      done(err);
    })

  });
  it("should find many tasks", function(done) {
    this.timeout(5000);

    Caseblocks.Task.getAll(["550c40d9841976debf000012","550c40d9841976debf000013","550c40d9841976debf000014","550c40d9841976debf000015","550c40d9841976debf000016","550c40d9841976debf000017"]).then(function(tasks) {
      tasks.length.should.equal(6)
      tasks[2].description.should.equal("Merge in Github")
      tasks[2].status.should.equal("not_started")
      done();
    }).catch(function(err){
      done(err);
    });
  });

  it("should execute a task", function(done) {
    this.timeout(5000);

    Caseblocks.Task.get("550c40d9841976debf000019").then(function(task) {
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
