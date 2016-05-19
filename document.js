var rest = require('restler-q');
var inflection = require( 'inflection' );
var _ = require('underscore')

var Q = require('q');

var Document = function(attributes, kase) {
  for(var k in attributes) {
    this[k] = attributes[k];
  }
  this.kase = kase;
  this.id = attributes._id

  this.base_url = this.url.split("/").slice(0,-1).join("/")
};

Document.prototype.rename = function(newFilename) {
  if (!Document.Caseblocks)
    throw "Must call Caseblocks.setup";

  var _this = this
  var originalFilename = _this.file_name
  var originalUrl = _this.url

  return Q.fcall(function(data) {
    var url = _this.url
    return rest.put(Document.Caseblocks.buildUrl(url), {data: {"new_file_name": newFilename}}).then(function(jsonResponse) {
      var response = JSON.parse(jsonResponse)
      _this.file_name = response.file_name
      _this.url = response.url
      // Iterate through each of the files in the case
      // check for 'document' field and update if matched against current image

      _this.documentRespnose = response

      var documentField = {}
      for (var key in _this) {
        documentField[key] = _this[key]
      }

      delete documentField.base_url
      delete documentField.kase

      return _this.kase.caseType().then(function(caseType) {
        var documentFields = caseType.fieldsOfType("document")
        var field = _.find(documentFields, function(field) { return _this.kase.attributes[field.name].url == originalUrl })
        _this.kase.attributes[field.name].file_name = _this.file_name
        _this.kase.attributes[field.name].url = _this.url
        return _this.kase.save().then(function(casedata) {
          return _this;
        }).fail(function(err) {
          console.log(err)
          throw new Error("Error saving case");
        });
      }).fail(function(err) {
        console.log(err)
        throw new Error("Error loading case type document");
      });
    }).fail(function(err) {
      console.log(err)
      throw new Error("Error renaming document");
    });
  });
}

Document.prototype.delete = function() {
  if (!Document.Caseblocks)
    throw "Must call Caseblocks.setup";

  throw("Not implemented Yet")
}

module.exports = Document;
