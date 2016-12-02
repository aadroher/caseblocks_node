const rest = require('restler-q')
const inflection = require( 'inflection' )
const Conversation = require('./conversation.js')
const Document = require('./document.js')
const Casetype = require('./casetype.js')
const User = require('./user.js')
const Team = require("./team.js")
const _ = require('underscore')


class Case {

  static get max_page_size() {
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

        return this._search_via_api(caseTypeRepresentation, query)

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

        return caseTypeResults.cases.map(attributes => new Case(attributes))

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
    const uri = Case.Caseblocks.buildUrl(`/case_blocks/${cleanCaseTypeName}/search.json`)

    const searchParams = {
      properties: query,
      page_size: Case.max_page_size,
      page: 0
    }

    return rest.postJson(uri, searchParams, {headers: {"Accept": "application/json"}})
      .then(result => {
        const pages = Math.trunc(result.summary.available_cases / Case.max_page_size) + 1

        // We already have page 0

        return Array



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