const fetch = require('node-fetch')
const Headers = require('node-fetch').Headers
const User = require('./user.js')


function requestOptions(options={}) {

  const defaultHeaders = new Headers({
    'Accept': 'application/json'
  })

  const defaultOptions = {
    headers: defaultHeaders
  }

  return Object.assign(defaultOptions, options)

}


let Team = function(attributes) {

  for(let k in attributes) {
    this[k] = attributes[k];
  }

}

Team.get = function(id) {
  if (!Team.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  const uri = Team.Caseblocks.buildUrl("/case_blocks/teams/" + id)
  return fetch(uri, requestOptions())
    .then(response => response.json())
    .then(responseBody =>
      new Team(responseBody.team)
    )

};

Team.prototype.members = function() {
  if (!Team.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  const query = this.team_membership_ids.map(id => "ids%5B%5D=" + id).join("&")
  const uri = Team.Caseblocks.buildUrl("/case_blocks/team_memberships?" + query)

  return fetch(uri, requestOptions())
    .then(response => response.json())
    .then(responseBody => {

      const userIds = responseBody.team_memberships.map(
        team_membership => team_membership.user_id
      )

      const userRequestPromises = userIds.map(userId => {

        const uri = Team.Caseblocks.buildUrl("/case_blocks/users/" + userId)

        return fetch(uri, requestOptions())
          .then(response => response.json())
          .then(responseBody =>
            new User(responseBody.user)
          )

      })

      return Promise.all(userRequestPromises)

    })

};

module.exports = Team;
