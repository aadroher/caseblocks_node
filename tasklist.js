
//var rest = require('rest')
var rest = require('restler-q');
var inflection = require( 'inflection' );
var Task = require('./task.js');
// var Q = require('q');


var Tasklist = function(attributes) {
  for(var k in attributes) {
    if (k != "tasks") {
      this[k] = attributes[k]
    } else {
      this["_tasks"] = attributes["tasks"]
    }
  }
}

Tasklist.get = function(id) {
  if (!Tasklist.Caseblocks)
    throw "Must call Caseblocks.setup";

  url = Tasklist.Caseblocks.buildUrl("/case_blocks/tasklists?ids%5B%5D="+ id)

  // return Q.fcall(function(data) {
    return rest.get(url).then(function (payload) {
      payload = JSON.parse(payload).tasklists
      tasklist = new Tasklist(payload[0])
      return tasklist
    })
  // });
}

Tasklist.getAll = function(tasklist_ids) {
  if (!Tasklist.Caseblocks)
    throw "Must call Caseblocks.setup";

  url = Tasklist.Caseblocks.buildUrl("/case_blocks/tasklists?" + tasklist_ids.map(function(id) {return "ids%5B%5D="+id}).join("&"))
  // return Q.fcall(function(data) {
    return rest.get(url).then(function (payload) {
      payload = JSON.parse(payload).tasklists
      tasklists = []
      for(t in payload) {
        tasklists.push(new Tasklist(payload[t]))
      }
      return tasklists
    })
  // });
}

Tasklist.prototype.tasks = function() {
  if (!Tasklist.Caseblocks)
    throw "Must call Caseblocks.setup";

  url = Tasklist.Caseblocks.buildUrl("/case_blocks/tasks?" + this._tasks.map(function(id) {return "ids%5B%5D="+id}).join("&"))
  _this = this
  // return Q.fcall(function(data) {
    return rest.get(url).then(function(payload) {
      var tasks = []
      for(t in payload.tasks) {
        tasks.push(new Task(payload.tasks[t]))
      }
      return tasks
    })
  // })
}

module.exports = Tasklist;
