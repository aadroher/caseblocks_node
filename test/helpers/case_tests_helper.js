const nock = require("nock")
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
const _ = require('underscore')

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
  page_size: '1000',
  page: '0'
}


const getQueryMatcher = subQueryToMatch =>
  receivedQueryObject => {

    const queryObjectToMatch = Object.assign(authQuery, defaultPaginationQuery, subQueryToMatch)

    return _.isEqual(queryObjectToMatch, receivedQueryObject)

  }



chai.use(chaiAsPromised)

function setSinglePersonSearchResult(personReference) {

  nock(caseBlocksBaseURL)
    .get('/case_blocks/person/search.json')
    .query(getQueryMatcher({ query_string: `person_reference:${personReference}` }))
    .reply(200, (uri, requestBody) => {

      const matches = people.filter(person => person.person_reference === personReference)

      const responseBody = {
        summary: {
          available_cases: matches.length
        },
        person: matches
      }

      return JSON.stringify(responseBody)

    })

}

function setMutipleWeaponSearchResult(personReference) {

  nock(caseBlocksBaseURL)
    .get('/case_blocks/weapon/search.json')
    .query(getQueryMatcher({ query_string: `person_reference:${personReference}` }))
    .reply(200, (uri, requestBody) => {

      const matches = weapons.filter(weapon => weapon.person_reference === personReference)

      const responseBody = {
        summary: {
          available_cases: matches.length
        },
        weapon: matches
      }

      return JSON.stringify(responseBody)

    })

}

function setWithEmptyQueryString(pageSize) {

  // Nock needs a new definition for each new match ¯\_(ツ)_/¯
  const entries = people.length
  const pages = Math.ceil(entries / pageSize)

  const scope = nock(caseBlocksBaseURL)

  const pageNumbers = Array.from(new Array(pages).keys())

  pageNumbers.forEach(pageNumber => {
    scope
      .get('/case_blocks/person/search.json')
      .query(getQueryMatcher({
        query_string: '*:*',
        page: pageNumber.toString(),
        page_size: pageSize.toString()
      }))
      .reply(200, (uri, requestBody) => {

        const from = pageNumber * pageSize
        const to = (pageNumber + 1) * pageSize
        const matches = people.slice(from, to)

        const responseBody = {
          summary: {
            available_cases: people.length
          },
          person: matches
        }

        return JSON.stringify(responseBody)

      })
  })

}

function setPaginationSensitive(queryObject) {

  nock(caseBlocksBaseURL)
    .get('/case_blocks/person/search.json')
    .query(receivedQueryObject =>
      getQueryMatcher({ query_string: `person_reference:${personReference}` })(receivedQueryObject)
    )
    .reply(200, (uri, requestBody) => {

      const matches = people.filter(person => person.person_reference === personReference)

      const responseBody = {
        summary: {
          available_cases: matches.length
        },
        person: matches
      }

      return JSON.stringify(responseBody)

    })

}



module.exports = {
  setSinglePersonSearchResult,
  setMutipleWeaponSearchResult,
  setWithEmptyQueryString
}