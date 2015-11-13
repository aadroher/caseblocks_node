
var Case = require('./case.js')
var Tasklist = require('./tasklist.js')
var Task = require('./task.js')
var Bucket = require('./bucket.js')
var Email = require('./email.js')

var Caseblocks = function(host, token) {
  this.host = host
  this.token = token
}

Caseblocks.prototype.buildUrl = function(path) {
  var url = this.host+path
  if (url.indexOf("?") > 0)
    url = url + "&auth_token="+this.token
  else
    url = url + "?auth_token="+this.token

  return url
}

Caseblocks.setup = function(host, token) {
  caseblocks = new Caseblocks(host, token)

  Case.Caseblocks = caseblocks
  Tasklist.Caseblocks = caseblocks
  Task.Caseblocks = caseblocks
  Bucket.Caseblocks = caseblocks
  Email.Caseblocks = caseblocks
}




module.exports.setup = Caseblocks.setup
module.exports.Case = Case;
module.exports.Tasklist = Tasklist;
module.exports.Task = Task;
module.exports.Bucket = Bucket;
module.exports.Email = Email;
