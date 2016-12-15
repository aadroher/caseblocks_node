const fetch = require('node-fetch')
const Headers = require('node-fetch').Headers

function requestOptions(options={}) {

  const defaultHeaders = new Headers({
    'Accept': 'application/json'
  })

  const defaultOptions = {
    headers: defaultHeaders
  }

  return Object.assign(defaultOptions, options)

}

let User = function(attributes) {

  for(let k in attributes) {
    this[k] = attributes[k];
  }

}

User.get = function(id) {
  if (!User.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  const uri = User.Caseblocks.buildUrl("/case_blocks/users/" + id)

  return fetch(uri, requestOptions())
    .then(response => response.json())
    .then(responseBody =>
      new User(responseBody.user)
    )

};

User.getAll = function() {
  if (!User.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  const uri = User.Caseblocks.buildUrl("/case_blocks/users")

  return fetch(uri, requestOptions())
    .then(response => response.json())
    .then(
      responseBody => responseBody.users.map(
        userAttributes => new User(userAttributes)
      )
    )

};

module.exports = User;
