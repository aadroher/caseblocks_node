var rest = require('restler-q');
var inflection = require( 'inflection' );
var _ = require('underscore')

var Q = require('q');

var Casetype = function(attributes) {
  for(var k in attributes) {
    this[k] = attributes[k];
  }
};

Casetype.get = function(id) {
  if (!Casetype.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  return Q.fcall(function(data) {
    return rest.get(Casetype.Caseblocks.buildUrl("/case_blocks/case_types/"+id+ ".json"), {headers: {"Accept": "application/json"}}).then(function (caseTypeData) {
      return new Casetype(caseTypeData.case_type)
    }).fail(function(err) {
      throw err;
    });
  });
}

Casetype.prototype.fieldsOfType = function(fieldType) {
  var _this = this;
  var fields = [];

  schema = _this.schema[_this.schema.length-1]
  schema.fieldsets.forEach(function(fieldset) {
    fieldset.fields.forEach(function(field) {
      if (field.type == fieldType) {
        fields.push(field)
      }
    })
  })

  return fields
}

module.exports = Casetype;
