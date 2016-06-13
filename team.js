var rest = require('restler-q');
var inflection = require( 'inflection' );
var Q = require('q');
var User = require('./user.js');
var _ = require('underscore');

var Team = function(attributes) {
  for(var k in attributes) {
    this[k] = attributes[k];
  }
};

Team.get = function(id) {
  if (!Team.Caseblocks)
    throw new Error("Must call Caseblocks.setup");
  return Q.fcall(function(data) {
    return rest.get(Team.Caseblocks.buildUrl("/case_blocks/teams/" + id),  {headers: {"Accept": "application/json"}}).then(function(data) {
      return new Team(data.team);
    });
  });
};

Team.prototype.members = function() {
  if (!Team.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  var query = this.team_membership_ids.map(function(id) {return "ids%5B%5D=" + id}).join("&")

  return rest.get(Team.Caseblocks.buildUrl("/case_blocks/team_memberships?" + query),  {headers: {"Accept": "application/json"}}).then(function(data) {
    var user_ids = data.team_memberships.map(function(team_membership) {return team_membership.user_id})
    return Q.allSettled(
      user_ids.map(function(id) {
        return rest.get(Team.Caseblocks.buildUrl("/case_blocks/users/" + id),  {headers: {"Accept": "application/json"}}).then(function(data) {
          return new User(data.user)
        }).catch(function(err) {
          throw err;
        });
      })
    ).then(function(returned_users) {
      var fulfilled_users = _.filter(returned_users, function(u){return u.state == "fulfilled"});
      return _.map(fulfilled_users, function(u){return u.value});
    });
  })

};

module.exports = Team;
