
//var rest = require('rest')
var rest = require('restler-q');
var inflection = require( 'inflection' );

token = "tnqhvzxYaRnVt7zRWYhr"
host = "http://localhost:8888"
var Q = require('q');


var Tasklist = function(attributes) {
  for(var k in attributes) {
    this[k] = attributes[k]
  }
}

Tasklist.find = function(id) {
  url = host+"/case_blocks/tasklists?ids%5B%5D="+ id + "&auth_token="+token
  return Q.fcall(function(data) {
    return rest.get(url).then(function (payload) {
      payload = JSON.parse(payload).tasklists
      tasklist = new Tasklist(payload[0])
      return tasklist
    })
  });
}

Tasklist.findAll = function(tasklist_ids) {
  url = host+"/case_blocks/tasklists?" + tasklist_ids.map(function(id) {return "ids%5B%5D="+id}).join("&")
  url = url + "&auth_token="+token
  return Q.fcall(function(data) {
    return rest.get(url).then(function (payload) {
      payload = JSON.parse(payload).tasklists
      tasklists = []
      for(t in payload) {
        tasklists.push(new Tasklist(payload[t]))
      }
      return tasklists
    })
  });
}

module.exports = Tasklist;
