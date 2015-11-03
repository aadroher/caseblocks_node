var helper = require("./spec_helper")

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
      var tasklists_returned = tasklists.length
      tasklists.forEach(function(tasklist) {
        tasklist.tasks().then(function(tasks) {
          tasks.forEach(function(task) {
            all_tasks.push(task)
          });
          tasklists_count++;
          if (tasklists_returned == tasklists_count) {
            done();
          }
        }).catch(function(err){
          done(err);
        });
      })
    }).catch(function(err){
      done(err);
    });

  });

});
