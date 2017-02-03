const nock = require("nock")
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
const _ = require('underscore')

// Import collections.
const {
  people,
  messages
} = require('./collections')

// Global constants
const caseBlocksBaseURL = 'http://test-caseblocks-location'
const authToken = 'tnqhvzxYaRnVt7zRWYhr'

const authQuery = {
  auth_token: authToken
}

const getQueryMatcher = () =>
  receivedQueryObject => {

    const queryObjectToMatch = authQuery

    return _.isEqual(queryObjectToMatch, receivedQueryObject)

  }

function setConversationCreationResult() {

  const requestBody = messages[0]

  console.log(requestBody)

  nock(caseBlocksBaseURL)
    .post('/caseblocks/messages', requestBody)
    .query(getQueryMatcher())
    .reply(200, (uri, requestBody) => {

      console.log(requestBody)

    })

}





module.exports = {
  setConversationCreationResult
}