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


const getQueryMatcher = (subQueryToMatch={}, withPagination=true) =>
  receivedQueryObject => {

    const queryObjectToMatch = Object.assign(
      authQuery,
      withPagination ? defaultPaginationQuery : {},
      subQueryToMatch
    )

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

function setRelatedDocuments(personCaseId) {

  const scope =
    nock(caseBlocksBaseURL)
    .get(`/case_blocks/people/${personCaseId}.json?auth_token=${authToken}`)
    .reply(200, (uri, requestBody) => {

      const matchedPerson = people.find(person => person._id === personCaseId)

      const responseBody = {
        person: matchedPerson
      }

      return responseBody

    })

  const caseTypeClassNames = [
    ['case_types', 'W'],
    ['people_types', 'P'],
    ['organization_types', '']
  ]

  caseTypeClassNames.forEach(entry => {

    const caseTypeClassName = entry[0]

    const matches = caseTypes.filter(caseType => caseType.system_category === entry[1])

    scope
      .get(`/case_blocks/${caseTypeClassName}.json?auth_token=${authToken}`)
      .reply(200, (uri, requestBody) => {

        const responseBody = {
          [caseTypeClassName]: matches
        }

        return JSON.stringify(responseBody)

      })

  })

  // Manually build get query string for relationships

  const idsGetQuerySubstring = relationships.map(
    relationship => `ids[]=${relationship.id}`
  ).join('&')

  const getQueryString = `${idsGetQuerySubstring}&auth_token=${authToken}`

  scope
    .get(`/case_blocks/case_type_direct_relationships.json?${getQueryString}`)
    .reply(200, (uri, requestBody) => {

      return JSON.stringify({
        case_type_direct_relationships: relationships
      })

    })


  // TODO: Assuming seach by person reference from weapon to person through person_reference.
  // TODO: Parameterize this.

  setMutipleWeaponSearchResult(2)

}




module.exports = {
  setSinglePersonSearchResult,
  setMutipleWeaponSearchResult,
  setWithEmptyQueryString,
  setRelatedDocuments
}