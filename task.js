
//var rest = require('rest')
var rest = require('restler-q');
var inflection = require( 'inflection' );

token = "tnqhvzxYaRnVt7zRWYhr"
host = "http://localhost:8888"
var Q = require('q');


var Task = function(attributes) {
  for(var k in attributes) {
    this[k] = attributes[k]
  }
}


Task.find = function(id) {
  url = host+"/case_blocks/tasks?ids%5B%5D="+id+"&auth_token="+token

  return Q.fcall(function(data) {
    return rest.get(url).then(function (payload) {
      payload = payload.tasks
      return new Task(payload[0])
    })
  });
}

Task.findAll = function(ids) {
  url = host+"/case_blocks/tasks?" + ids.map(function(id) {return "ids%5B%5D="+id}).join("&")
  url = url + "&auth_token="+token

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

module.exports = Task;
