var helper = require("./helpers/spec_helper")

var should = require('chai').should(),
    Tasklist = require('../tasklist.js'),
    Caseblocks = require('../index')

describe('tasklists', function() {

  beforeEach(function() {
    this.timeout(5000);
    Caseblocks.setup("http://test-caseblocks-location", "tnqhvzxYaRnVt7zRWYhr")

    helper.nockHttp()
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

  it("should find tasks from many tasklists", function(done) {
    this.timeout(5000);

    var all_tasks = [];
    var tasklists_count = 0;

    Caseblocks.Tasklist.getAll(["550c40d9841976debf000018", "550c40d9841976debf00001a", "550c40d9841976debf00001c"]).then(function(tasklists) {

      var taskCounter = 0;
      for(var i=0; i< tasklists.length; i++){
        tasklists[i].tasks().then(function (tasks) {
          if (taskCounter==0) {
            tasks.length.should.equal(1)
            tasks[0].description = "Create Pull Request"

          } else if (taskCounter==1) {
            tasks.length.should.equal(6)
            tasks[0].description = "asdf"

          } else if (taskCounter==2) {
            tasks.length.should.equal(1)
            tasks[0].description = "test task"

            done();

          }
          taskCounter++;
        }).catch(function(err){
          done(err);
        })
      }

    }).catch(function(err){
      done(err);
    });

  });

});
