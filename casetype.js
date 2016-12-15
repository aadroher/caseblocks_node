const fetch = require('node-fetch')
const Headers = require('node-fetch').Headers

class Casetype {

  static get(id) {

    if (!Casetype.Caseblocks) {

      throw new Error("Must call Caseblocks.setup");

    } else {

      const uri = Casetype.Caseblocks.buildUrl(`/case_blocks/case_types/${id}.json`)

      return fetch(uri, Casetype._requestOptions())
        .then(response => response.json())
        .then(caseTypeData =>

          new Casetype(caseTypeData.case_type)

        )

    }

  }

  constructor(attributes) {

    // Avoid iterating over inherited properties
    for (let key of Object.keys(attributes)) {
      this[key] = attributes[key]
    }

  }

  fieldsOfType(typeName) {

    // This does not mutate `this.schema`. `slice` returns a copy.
    const currentSchema = this.schema.slice(-1).pop()

    // Flatten `this.schema` by reducing it.
    return currentSchema.fieldsets.reduce((prevVal, fieldset) => {

      const newFields = fieldset.fields.filter(field => field.type === typeName)

      return [...prevVal, ...newFields]

      }, [])

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

}

module.exports = Casetype
