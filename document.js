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
  _this.debug = []
  var originalFilename = _this.file_name
  var originalUrl = _this.url
  _this.debug.push("starting rename")
  return Q.fcall(function(data) {
    var url = _this.url
    var formData = {"new_file_name": newFilename}
    _this.requestData = formData
    _this.requestUrl = Document.Caseblocks.buildUrl(url) + "&new_file_name="+newFilename
    return rest.put(Document.Caseblocks.buildUrl(url) + "&new_file_name="+newFilename, {data: formData}).then(function(jsonResponse) {
      var response = JSON.parse(jsonResponse)
      _this.file_name = response.file_name
      _this.url = response.url

      _this.documentRespnose = response
/*
      var documentField = {}
      for (var key in _this) {
        documentField[key] = _this[key]
      }

      delete documentField.base_url
      delete documentField.kase*/

      return _this

      /*return _this.kase.caseType().then(function(caseType) {
        var documentFields = caseType.fieldsOfType("document")
        var field = _.find(documentFields, function(field) { return _this.kase.attributes[field.name].url == originalUrl })
        if (typeof(field) != "undefined") {
          _this.debug.push("found field " + field.name)
          _this.kase.attributes[field.name].file_name = _this.file_name
          _this.debug.push("set field file_name to " + _this.file_name)
          _this.kase.attributes[field.name].url = _this.url
          _this.debug.push("set field url to " + _this.url)
          delete _this.kase.version
          return _this.kase.save().then(function(casedata) {
            _this.debug.push("successfully saved case")
            return _this;
          }).fail(function(err) {
            _this.debug.push(err)
            throw new Error("Error saving case");
          });
        } else {
          return _this;
        }
      }).fail(function(err) {
        console.log(err)
        throw new Error("Error loading case type document");
      });*/
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
