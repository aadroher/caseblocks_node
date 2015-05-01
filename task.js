
//var rest = require('rest')
var rest = require('restler-q');
var inflection = require( 'inflection' );
var Q = require('q');

var Task = function(attributes) {
  for(var k in attributes) {
    this[k] = attributes[k]
  }
}


Task.get = function(id) {
  if (!Task.Caseblocks)
    throw "Must call Caseblocks.setup";

  url = Task.Caseblocks.buildUrl("/case_blocks/tasks?ids%5B%5D="+id)

  return Q.fcall(function(data) {
    return rest.get(url).then(function (payload) {
      payload = payload.tasks
      return new Task(payload[0])
    })
  });
}

Task.getAll = function(ids) {
  if (!Task.Caseblocks)
    throw "Must call Caseblocks.setup";

  url = Task.Caseblocks.buildUrl("/case_blocks/tasks?" + ids.map(function(id) {return "ids%5B%5D="+id}).join("&"))

  return Q.fcall(function(data) {
    return rest.get(url).then(function (payload) {
      payload = payload.tasks
      tasks = []
      for(t in payload) {
        tasks.push(new Task(payload[t]))
      }
      return tasks
    })
  });

}

Task.prototype.execute = function() {
  if (!Task.Caseblocks)
    throw "Must call Caseblocks.setup";

  url = Task.Caseblocks.buildUrl("/case_blocks/tasks/" + this.id)
  _this = this
  _this.status = "in_progress"
  payload = {task: _this}
  return Q.fcall(function(data) {
    return rest.putJson(url, payload).then(function(data) {
      return _this
    })
  })
}

module.exports = Task;
