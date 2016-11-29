const rest = require('restler-q');
const inflection = require( 'inflection' );

class Casetype {

  static get(id) {

    if (!Casetype.Caseblocks) {

      throw new Error("Must call Caseblocks.setup");

    } else {

      const uri = Casetype.Caseblocks.buildUrl(`/case_blocks/case_types/${id}.json`)

      return rest.get(uri, { headers: { "Accept": "application/json" }})
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

}

module.exports = Casetype;
