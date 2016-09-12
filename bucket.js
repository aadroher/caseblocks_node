var rest = require('restler-q');
var inflection = require( 'inflection' );
var Case = require('./case.js');
var Q = require('q');

var Bucket = function(attributes) {
  this.attributes = {};
  this.case_type_code = attributes.case_type_code
  delete attributes.case_type_code
  for(var k in attributes) {
    this.attributes[k] = attributes[k];
  }
  this.id = this.attributes.id;
};

const addAdditionalSearchTermsToURL = (url, searchField, searchTerm) => {
  if (searchField!==undefined && searchTerm!==undefined) {
    if (url.indexOf('?')<0) {
      url += '?'
    } else {
      url += '&'
    }
    url = url + "search_field=" + encodeURIComponent(searchField) + "&search_term=" + encodeURIComponent(searchTerm)
  }
  return url
}

Bucket.get = function(bucket_id, case_type_code, searchField, searchTerm) {
  if (!Bucket.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  return Q.fcall(function(data) {
    const url = addAdditionalSearchTermsToURL("/case_blocks/buckets/" + bucket_id, searchField, searchTerm)
    return rest.get(Bucket.Caseblocks.buildUrl(url),  {headers: {"Accept": "application/json"}}).then(function(data) {
      bucket_data = data["bucket"]
      bucket_data.case_type_code = case_type_code
      bucket_data.searchField = searchField
      bucket_data.searchTerm = searchTerm
      return new Bucket(bucket_data)
    })
  })
}

Bucket.prototype.stats = function() {
  if (!Bucket.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  let _this = this;
  return Q.fcall(function(data) {
    const url = addAdditionalSearchTermsToURL("/case_blocks/bucket_stats/" + _this.id, _this.attributes.searchField, _this.attributes.searchTerm)
    return rest.get(Bucket.Caseblocks.buildUrl(url), {headers: {"Accept": "application/json"}}).then(function(data) {
      return data;
    });
  });
}

Bucket.prototype.cases = function(page, pageSize) {
  if (!Bucket.Caseblocks)
    throw new Error("Must call Caseblocks.setup");
  let _this = this;
  return Q.fcall(function(data) {
    if (typeof page == "undefined") {
      page = 0
    }
    if (typeof pageSize == "undefined") {
      pageSize = 10
    }
    const url = addAdditionalSearchTermsToURL("/case_blocks/" + _this.case_type_code + "?bucket_id=" + _this.id + "&page=" + page + "&page_size=" + pageSize, _this.attributes.searchField, _this.attributes.searchTerm) 
    return rest.get(Bucket.Caseblocks.buildUrl(url), {headers: {"Accept": "application/json"}}).then(function(data) {
      cases = []
      for (kase of data[_this.case_type_code]) {
        cases.push(new Case(kase))
      }
      return cases;
    });
  });

};

module.exports = Bucket;
