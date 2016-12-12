const qs = require('qs')
const rest = require('restler-q')
const fetch = require('node-fetch')
const Headers = require('node-fetch').Headers
const inflection = require( 'inflection' )
const Conversation = require('./conversation.js')
const Document = require('./document.js')
const Casetype = require('./casetype.js')
const User = require('./user.js')
const Team = require("./team.js")
const _ = require('underscore')

class Case {

  // ################
  // Static constants
  // ################

  // TODO: This is hardcoded. Move it to a config file.
  static get maxPageSize() {

    return 1000

  }

  // ##############
  // Static methods
  // ##############

  static create(caseTypeName, caseTypeId, properties, options) {

    // TODO: This recurring condition should be moved to a some sort of decorator.
    if (!Case.Caseblocks) {

      throw new Error("Must call Caseblocks.setup")

    } else {

      const caseProperties = Object.assign(properties, {
        case_type_id: caseTypeId
      })

      const uniqueOption = _.pick(options,
        (val, key) => key === 'unique' && val !== 'unidefined'
      )

      const payload = Object.assign(
        {'case': caseProperties},
        uniqueOption
      )

      const uri = Case.Caseblocks.buildUrl(`/case_blocks/${caseTypeName}.json`)

      return rest.postJson(uri, payload, {headers: {"Accept": "application/json"}})
        .then(caseData => {

          // Get the name of the first key.
          const caseTypeCode = Object.keys(caseData).pop()

          const attributes = caseData[caseTypeCode]

          return Object.assign(
            new Case(attributes),
            { case_type_code: caseTypeCode }
          )

        })

    }

  }

  static get(caseTypeName, id) {

    if (!Case.Caseblocks) {

      throw new Error("Must call Caseblocks.setup")

    } else {

      // Follow the same pattern as in `Case.create`.
      const uri = Case.Caseblocks.buildUrl(`/case_blocks/${caseTypeName}/${id}.json`)

      return rest.get(uri, {headers: {"Accept": "application/json"}})
        .then(caseData => {

          const caseTypeCode = Object.keys(caseData).pop()
          const caseTypeName = inflection.pluralize(caseTypeCode)

          const attributes = caseData[caseTypeCode]

          return Object.assign(
              new Case(attributes),
              {
                case_type_code: caseTypeCode,
                case_type_name: caseTypeName
              }
            )

        })

    }

  }

  // TODO: Add deprecation warning to the combination of argument values that trigger `_search`.
  /**
   * @param {number|string} caseTypeRepresentation
   * @param {string|object} query
   * @return {Promise.<[object]>}
   */
  static search(caseTypeRepresentation, query) {

    if (!Case.Caseblocks) {

      throw new Error("Must call Caseblocks.setup")

    } else {

      // JS automatically typecasts, but it should not.
      const caseTypeRepresentationStr = caseTypeRepresentation.toString()
      const caseTypeRepresentationIsNumeric = /^[1-9][0-9]*$/.test(caseTypeRepresentationStr)

      const queryIsString = typeof query === "string"

      if (caseTypeRepresentationIsNumeric && queryIsString) {

        return Case._search(parseInt(caseTypeRepresentation), query)

      } else {

        // If query is "falsey" return all results.
        const queryStringIsEmpty = queryIsString && query === ''

        const params = !queryIsString ? query : {
          query_string: queryStringIsEmpty ? '*:*' : query
        }

        return Case._searchViaApi(caseTypeRepresentation, params)

      }

    }

  }


  // ################
  // Instance methods
  // ################

  constructor(attributes) {

    this.attributes = attributes
    this.id = this.attributes._id

  }

  caseType() {

    const attrNames = [
      'case_type_id',
      'work_type_id',
      'organization_type_id',
      'people_type_id'
    ]

    // Pick the first that is not undefined.
    const caseTypeId = attrNames.reduce((prevVal, attrName) =>
        prevVal !== undefined ? prevVal : this.attributes[attrName]
      , undefined)

    return Casetype.get(caseTypeId)

  }

  documents() {

    const documents = this.attributes._documents || []

    return documents.map(documentData =>
      new Document(documentData, this)
    )

  }

  addConversation(subject, body, recipients, attachments) {

    if (!Case.Caseblocks) {

      throw new Error("Must call Caseblocks.setup")

    } else {

      return Conversation.create(this, {subject, body, recipients, attachments})

    }

  }

  conversations() {

    throw new Error('Not implemented.')

  }

  teams() {

    const requestPromises = this.attributes.participating_teams.map(id => Team.get(id))

    return Promise.all(requestPromises)

  }

  users() {

    const requestPromises = this.attributes.participating_users.map(id => User.get(id))

    return Promise.all(requestPromises)

  }

  // TODO: Remove options argument if not needed.
  participants(options={}) {

    if (!Case.Caseblocks) {

      throw new Error("Must call Caseblocks.setup")

    } else {

      const teamsPromise = this.teams()
      const usersPromise = this.users()

      return Promise.all([teamsPromise, usersPromise])
        .then(([teams, users]) => {

          const teamMembersPromises = teams.map(team => team.members())

          return Promise.all(teamMembersPromises)
            .then(teamMemberLists => {

              // Flatten
              const teamUsers = teamMemberLists.reduce((prevVal, memberList) =>
                  [...prevVal, ...memberList]
                , [])

              const participants = users.reduce((prevVal, user) => {

                const alreadyAdded = prevVal.some(addedUser =>
                  addedUser.id === user.id
                )

                return alreadyAdded ? prevVal : [...prevVal, user]

              }, teamUsers)

              return participants

            })

        })

    }

  }

  /**
   *
   * @param {string} relatedCaseTypeName
   * @param {number} [relationshipId=undefined]
   * @param {} [query=undefined]
   * @return {Promise.<[object]>}
   */
  related(relatedCaseTypeName, relationshipId) {

    if (!Case.Caseblocks) {

      throw new Error("Must call Caseblocks.setup")

    } else {

      const path = `/case_blocks/${relatedCaseTypeName}.json`
      const pageSize = 10000
      const page = 0

      const params = {
        relation_id: relationshipId,
        relationship_type: 'CaseBlocks::CaseTypeDirectRelationship',
        case_from_id: this.id,
        page_size: pageSize,
        page: page
      }

      const queryString = Object.keys(params).map(key =>
        `${encodeURIComponent(`related_cases[${key}]`)}=${encodeURIComponent(params[key])}`
      ).join('&')

      const uri = Case.Caseblocks.buildUrl(`${path}?${queryString}`)

      return rest.get(uri, {headers: {"Accept": "application/json"}})
        .then(result =>

          result[relatedCaseTypeName].map(attributes => new Case(attributes))

        )

    }

  }

  // TODO: Add the possibility to return the related cases filtered by a query.

  relatedByName(relatedCaseTypeName) {

    if (!Case.Caseblocks) {

      throw new Error("Must call Caseblocks.setup")

    } else {

      const caseTypeClassNames = [
        'case_types',
        'people_types',
        'organization_types'
      ]

      return (

        caseTypeClassNames.reduce((requestPromiseChain, caseTypeClassName) =>
            requestPromiseChain
              .then(prevResults => {

                const path = `/case_blocks/${caseTypeClassName}.json`
                const uri = Case.Caseblocks.buildUrl(path)

                return fetch(uri, Case._requestOptions())
                  .then(response => response.json())
                  .then(result =>
                    [
                      ...prevResults,
                      ...result[caseTypeClassName].map(caseTypeAttributes => new Casetype(caseTypeAttributes))
                    ]
                  )

              })
          , Promise.resolve([]))
          .then(caseTypes => {

            const thisCaseType =
              caseTypes.find(
                caseType =>
                  [
                    this.attributes.case_type_id,
                    this.attributes.people_type_id,
                    this.attributes.organization_type_id
                  ].includes(caseType.id)
              )

            console.log(relatedCaseTypeName)
            const relatedCaseType =
              caseTypes.find(
                caseType => caseType.code === relatedCaseTypeName
              )

            // Fetch direct relationships
            const path = `/case_blocks/case_type_direct_relationships.json`
            const getQueryString = thisCaseType.direct_relationships.map(relationshipId =>
              `ids[]=${relationshipId}`
            ).join('&')

            const uri = Case.Caseblocks.buildUrl(`${path}?${getQueryString}`)

            return fetch(uri, Case._requestOptions())
              .then(response => response.json())
              .then(result => {

                const directRelationships = result.case_type_direct_relationships

                return { thisCaseType, relatedCaseType, directRelationships }

              })

          })
          .then(({ thisCaseType, relatedCaseType, directRelationships }) => {


            const relationshipCaseTypeClassNames = [
              'work',
              'people',
              'organization'
            ]

            const fromIdFieldNames = relationshipCaseTypeClassNames.map(
              relationshipCaseTypeClassName => `from_${relationshipCaseTypeClassName}_type_id`
            )

            const toIdFieldNames = relationshipCaseTypeClassNames.map(
              relationshipCaseTypeClassName => `to_${relationshipCaseTypeClassName}_type_id`
            )

            // Catch relevant relationships
            const relevantRelationships =
              directRelationships.filter(relationship => {

                const fromFieldCandidates = fromIdFieldNames.map(
                  fromIdFieldName => relationship[fromIdFieldName]
                )

                const toFieldCandidates = toIdFieldNames.map(
                  toIdFieldName => relationship[toIdFieldName]
                )

                return (
                  fromFieldCandidates.includes(thisCaseType.id)
                  && toFieldCandidates.includes(relatedCaseType.id)
                )

              })

            // Fetch all related cases per relationship.
            const relatedCasesRequestPromises =
              relevantRelationships.map(relationship => {

                const searchQuery = `${relationship.to_key}:${this.attributes[relationship.from_key]}`


                return Case._searchViaApi(relatedCaseType.code, {query_string: searchQuery})
                  .then(cases => ({relationship, cases}))

              })

            return Promise.all(relatedCasesRequestPromises)

          })

      )

    }

  }

  save() {

    if (!Case.Caseblocks) {

      throw new Error("Must call Caseblocks.setup")

    } else {

      const payload = {

        [this.case_type_code]: _.omit(this.attributes, 'tasklists', '_documents', 'version')

      }

      const uri = Case.Caseblocks.buildUrl(`/case_blocks/${this.case_type_name}/${this.id}.json`)

      return rest.putJson(uri, payload, {headers: {"Accept": "application/json"}})
        .then(caseData => {

          const caseTypeCode = Object.keys(caseData).pop()

          const attributes = caseData[caseTypeCode]

          this.attributes = attributes

          return this

        })
        .catch(err => {

          const msg = 'Error saving case' +
                      `Error: ${err.message}`

          throw Error(msg)

        })


    }

  }

  // TODO: Do not use a reserved word.
  ['delete']() {

    throw new Error('Not implemented.')

  }


  // #################
  // "Private" methods
  // #################

  // Static

  static _requestOptions(options={}) {

    const defaultHeaders = new Headers({
      'Accept': 'application/json'
    })

    const defaultOptions = {
      headers: defaultHeaders
    }

    return Object.assign(defaultOptions, options)

  }

  /**
   * This is a new implementation of the old search function.
   * @param {number} caseTypeId
   * @param {string} query
   * @return {Promise.<[object]>}
   * @private
   */
  static _search(caseTypeId, query) {

    const queryObject = {query}

    const uri = Case.Caseblocks.buildUrl(`/case_blocks/search.json?${qs.stringify(queryObject)}`)

    return rest.get(uri,  {headers: {"Accept": "application/json"}})
      .then(results => {

        const caseTypeResults = results.find(result =>
            result.case_type_id === caseTypeId
          ) || []

        return (caseTypeResults.cases || []).map(attributes => new Case(attributes))

      })
      .catch(err => {
        console.log(err.message)
        throw err
      })

  }

  /**
   * @param {string} caseTypeName - A singular underscored case type name.
   * @param {object|string} query - A filter query representation with the following the pattern:
   *  {
   *    field_name_0: value_to_match_0,
   *    ...
   *    field_name_n: value_to_match_n,
   *  }
   *  or an elasticsearch query string.
   * @return {Promise.<[object]>}
   * @private
   */
  static _searchViaApi(caseTypeName, query) {

    // The API endpoint expects URI encoded spaces to separate case type
    // name words.
    const encodedCaseTypeName = encodeURIComponent(caseTypeName.replace(/_/g, ' '))

    const options = {
      headers: {"Accept": "application/json"},
      query: query
    }

    return Case._getSearchRequests(encodedCaseTypeName, options)

  }

  /**
   * Since there is no guarantee that the Case.maxPageSize is greater
   * than the amount of cases to be returned (although it's an edge case)
   * a chain of request promises has to be built in order to retrieve them
   * all.
   * @param encodedCaseTypeName
   * @param options
   * @return {Promise.<[Case]>}
   * @private
   */
  // TODO: The logic in this function is not DRY but 1 + N. Abstract it.
  static _getSearchRequests(encodedCaseTypeName, options) {

    // Manually build URI. Hardcoded GET query in URL (as Caseblocks.buildURL generates)
    // seems to take precedence to the `query` option in `restler.get`.
    const baseUri = `${Case.Caseblocks.host}/case_blocks/${encodedCaseTypeName}/search.json`

    const queryDefaults = {
      page_size: Case.maxPageSize,
      page: 0,
      auth_token: Case.Caseblocks.token
    }

    const getParams = Object.assign(queryDefaults, options.query)

    const getQueryStr = qs.stringify(getParams, { format : 'RFC1738' })

    const uri = `${baseUri}?${getQueryStr}`

    return fetch(uri, Case._requestOptions())
      .then(response => {

        if (response.ok) {

          return response.json()

        } else {

          return response.text()

          const msg = `Error ${response.status}: ${response.statusText}`
          throw new Error(msg)

        }
      })
      .then(result => {

        // The total count comes with each response.
        const availableCases = (result.summary || {}).available_cases

        if (availableCases === undefined) {

          const msg = 'Number of available cases unknown.'
          throw new Error(msg)

        } else {

          return { availableCases, result }

        }

      })
      .then(({ availableCases, result }) => {

        const caseTypeKey = decodeURIComponent(encodedCaseTypeName).replace(/_/g, ' ')
        const caseAttributes = result[caseTypeKey] || []
        const cases = caseAttributes.map(attributes => new Case(attributes))

        const numAdditionalRequests = Math.max(0, Math.ceil(availableCases / Case.maxPageSize) - 1)

        if (numAdditionalRequests === 0) {

          return cases

        } else {

          // This just creates a sequence [1, 2, ..., n].
          // Empty if numAdditionalRequests == 0.
          const pageNumbers = Array.from(new Array(numAdditionalRequests).keys()).map(i => i + 1)

          const requestPromises =
            pageNumbers.map(pageNumber => {

              const pageGetParams = Object.assign(getParams, {
                page: pageNumber
              })

              const getQueryStr = qs.stringify(pageGetParams)
              const uri = `${baseUri}?${getQueryStr}`

              return fetch(uri, Case._requestOptions())
                .then(response => {
                  if (response.ok) {

                    return response.json()

                  } else {

                    const msg = `Error ${response.status}: ${response.statusText}`
                    throw new Error(msg)

                  }
                })
                .then(result => {

                  const caseAttributes = result[caseTypeKey] || []

                  return {
                    page: pageNumber,
                    cases: caseAttributes.map(attributes => new Case(attributes))
                  }

                })
                .catch(err => {
                  console.log(err.message)
                  throw err
                })

            })

          return Promise.all(requestPromises).then(results =>
            // Sort and flatten
            results.sort(
              (a, b) => parseInt(a.page) - parseInt(b.page)
            ).reduce(
              (alreadyFlattened, newResult) => [...alreadyFlattened, ...newResult.cases],
              cases // This is the result of the first call.
            )
          ).catch(err => {
            console.log(err.message)
            throw err
          })

        }
      })
      .catch(err => {
        console.log(err.message)
        throw err
      })
  }

}


module.exports = Case