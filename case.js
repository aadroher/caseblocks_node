const rest = require('restler-q')
const inflection = require( 'inflection' )
const Conversation = require('./conversation.js')
const Document = require('./document.js')
const Casetype = require('./casetype.js')
const User = require('./user.js')
const Team = require("./team.js")
const _ = require("underscore")

class Case {

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

      return rest.get(uri, {headers: {"Accept": "application/json"}}).then(caseData => {

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

  static search() {

    throw new Error('Not implemented.')

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

  related() {

    throw new Error('Not implemented.')

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