
//var rest = require('rest')
var rest = require('restler-q');
var inflection = require( 'inflection' );

token = "tnqhvzxYaRnVt7zRWYhr"
host = "http://localhost:8888"
var Q = require('q');


var Case = function(attributes) {
  for(k in attributes) {
    this[k] = attributes[k]
  }
}

Case.create = function(case_type_name, case_type_id, properties) {

  payload = {case: {}}
  properties.case_type_id = case_type_id
  payload["case"][case_type_name] = properties

  url = host+"/case_blocks/"+case_type_name+"?auth_token="+token
  _this = this
  _this.case_type_name = case_type_name
  return Q.fcall(function(data) {
    return rest.postJson(url, payload).then(function (caseData) {
      for (var k in caseData) {
        _this.case_type_code = k
        _this.attributes = caseData[k]
        _this.id = _this.attributes._id
        break
      }
      return _this
    })
  });

}

Case.find = function(case_type_name, id) {
  url = host+"/case_blocks/"+case_type_name+"/"+id+"?auth_token="+token
  _this = new Case()
  _this.case_type_name = case_type_name
  _this.id = id
  return Q.fcall(function(data) {
    return rest.get(url).then(function (caseData) {
      for (var k in caseData) {
        _this.case_type_code = k
        _this.attributes = caseData[k]
        break
      }
      return _this
    })
  });
}

Case.prototype.save = function() {
  // save current data to caseblocks
  url = host+"/case_blocks/"+this.case_type_name+"/"+this.id+"?auth_token="+token
  _this = this
  return Q.fcall(function(data) {
    payload = {}
    payload[_this.case_type_code] = _this.attributes
    delete payload[_this.case_type_code].tasklists
    delete payload[_this.case_type_code]._documents
    return rest.putJson(url, payload).then(function(data) {

      return _this
    })
  });
}

Case.prototype.delete = function() {

}

Case.prototype.related = function(case_type_code) {
  // returns related cases to the case type specified
}


module.exports = Case;
