var rest = require('restler-q');
var inflection = require( 'inflection' );
var Q = require('q');

var User = function(attributes) {
  for(var k in attributes) {
    this[k] = attributes[k];
  }
};

User.get = function(id) {
  if (!User.Caseblocks)
    throw new Error("Must call Caseblocks.setup");
  return Q.fcall(function(data) {
    return rest.get(User.Caseblocks.buildUrl("/case_blocks/users/" + id),  {headers: {"Accept": "application/json"}}).then(function(data) {
      return new User(data.user);
    });
  });
};

module.exports = User;
