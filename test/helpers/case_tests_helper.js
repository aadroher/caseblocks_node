const nock = require("nock")
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")

// Import collections.
const {
  caseTypes,
  people,
  weapons,
  relationships
} = require('./collections')

// Global constants
const caseBlocksBaseURL = 'http://test-caseblocks-location'
const authToken = 'tnqhvzxYaRnVt7zRWYhr'

const defaultHeaders = {
  'Accept': ['application/json']
}

const authQuery = {
  auth_token: authToken
}

const defaultPaginationQuery = {
  page_size: 1000,
  page: 0
}


const getQueryMatcher = queryToMatch =>
  queryObject =>
    Object.assign(
      authQuery,
      defaultPaginationQuery,
      queryToMatch
    )

chai.use(chaiAsPromised)

function nockHttp() {

  nock(caseBlocksBaseURL)
    .get('/case_blocks/person/search.json')
    .query(function(_) {return  true})
    // .query(function(queryObject) {
    //   console.log(queryObject)
    //   const expected = getQueryMatcher({ query_string: 'person_reference%3A1' })(queryObject)
    //   console.log(expected)
    //   return true
    // })
    .reply(200, {message: 'ok'})

}

module.exports = {
  nockHttp
}