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

const headers = {
  reqheaders: {'accept': 'application/json'}
}

function setConversationCreationResult() {

  const postData = messages[0]

  nock(caseBlocksBaseURL)
    .post('/caseblocks/messages?auth_token=tnqhvzxYaRnVt7zRWYhr', (requestBody) => {
      console.log(requestBody)
    })
    .reply(200, (uri, requestBody) => {

      console.log(requestBody)

    })

}


module.exports = {
  setConversationCreationResult
}