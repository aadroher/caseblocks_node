const rest = require('restler-q')
const inflection = require( 'inflection' )
const Conversation = require('./conversation.js')
const Document = require('./document.js')
const Casetype = require('./casetype.js')
const User = require('./user.js')
const Team = require("./team.js")
const _ = require('underscore')


class Case {

  static get maxPageSize() {
    return 1000
  }

  // Static methods

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
            {case_type_code: caseTypeCode}
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

  // TODO: Add deprecation warning to the combinationof argument values that trigger `_search`.
  /**
   * @param caseTypeRepresentation {number|string}
   * @param query {string|object}
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

        return this._search(parseInt(caseTypeRepresentation), query)

      } else {

        const params = !queryIsString ? query : {
          query_string: query
        }

        return this._search_via_api(caseTypeRepresentation, params)

      }

    }

  }

  /**
   * This is a new implementation of the old search function.
   * @param caseTypeId {number}
   * @param query {string}
   * @return {Promise.<[object]>}
   * @private
   */
  static _search(caseTypeId, query) {

    const uri = Case.Caseblocks.buildUrl(`/case_blocks/search.json?query=${query}`)

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
   * @param caseTypeName {string} A singular underscored case type name.
   * @param query {object} A filter query representation with the following the pattern:
   *  {
   *    field_name_0: value_to_match_0,
   *    ...
   *    field_name_n: value_to_match_n,
   *  }
   * @return {Promise.<[object]>}
   * @private
   */
  static _search_via_api(caseTypeName, query) {

    // The API endpoint expects URI encoded spaces to separate case type
    // name words.
    const cleanCaseTypeName = encodeURIComponent(caseTypeName.replace('_', ' '))

    const options = {
      headers: {"Accept": "application/json"},
      query: query
    }

    return Case._getSearchRequestChain(cleanCaseTypeName, options)

  }

  /**
   * Since there is no guarantee that the Case.maxPageSize is greater
   * than the amount of cases to be returned (although it's an edge case)
   * a chain of request promises has to be built in order to retrieve them
   * all.
   * @param caseTypeName
   * @param options
   * @return {Promise.<[Case]>}
   * @private
   */
  static _getSearchRequestChain(caseTypeName, options) {

    // Manually build URI. Hardcoded GET query in URL (as Caseblocks.buildURL generates)
    // seems to take precedence to the `query` option in `restler.get`.
    const uri = `${Case.Caseblocks.host}/case_blocks/${caseTypeName}/search.json`

    const queryDefaults = {
      page_size: Case.maxPageSize,
      page: 0,
      auth_token: Case.Caseblocks.token
    }

    const searchParams = Object.assign(queryDefaults, options.query)

    const updatedOptions = Object.assign(options, {
      query: searchParams
    })

    return rest.get(uri, updatedOptions)
      .then(result => {

        // The total count comes with each response.
        const availableCases = (result.summary || {}).available_cases

        if (availableCases === undefined) {

          const msg = 'Number of available cases unknown.'
          throw new Error(msg)

        } else {

          const caseAttributes = result[caseTypeName] || []
          const cases = caseAttributes.map(attributes => new Case(attributes))

          const numAdditionalRequests = Math.ceil(availableCases / options.query.page_size) - 1

          if (numAdditionalRequests === 0) {

            return cases

          } else {

            // This just creates a sequence [1, 2, ..., n].
            // Empty if numAdditionalRequests == 0.
            const pageNumbers = Array.from(new Array(numAdditionalRequests).keys()).map(i => i + 1)
            console.log(pageNumbers)

            // Build and return promise chain.

            const basePromise = Promise.resolve(cases)

            const requestPromiseChain =
              pageNumbers.reduce((promise, pageNumber) =>
                  promise.then(cases => {

                    // TODO: Make this update nicer.
                    const newOptions = Object.assign(updatedOptions, {
                      query: Object.assign(updatedOptions.query, {
                        page: pageNumber
                      })
                    })

                    return rest.get(uri, newOptions)
                      .then(result => {

                        const caseAttributes = result[caseTypeName] || []

                        return cases.concat(
                          caseAttributes.map(attributes => new Case(attributes))
                        )

                      })

                  })
                , basePromise)

            return requestPromiseChain

          }

        }

      })
      .catch(err => console.log(err))

  }

  // Instance methods

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

  related(relatedCaseTypeName, relationId) {

    if (!Case.Caseblocks) {

      throw new Error("Must call Caseblocks.setup")

    } else {

      const path = `/case_blocks/${relatedCaseTypeName}.json`
      const pageSize = 10000
      const page = 0

      const params = {
        relation_id: relationId,
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

}



module.exports = Case