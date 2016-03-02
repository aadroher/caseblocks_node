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

Bucket.get = function(bucket_id, case_type_code) {
  return Q.fcall(function(data) {
    return rest.get(Bucket.Caseblocks.buildUrl("/case_blocks/buckets/" + bucket_id)).then(function(data) {
      bucket_data = data["bucket"]
      bucket_data["case_type_code"] = case_type_code
      return new Bucket(bucket_data);
    });
  });
};

Bucket.prototype.stats = function() {
  if (!Bucket.Caseblocks)
    throw "Must call Caseblocks.setup";

  var _this = this;
  return Q.fcall(function(data) {
    console.log(_this.id)
    return rest.get(Bucket.Caseblocks.buildUrl("/case_blocks/bucket_stats/" + _this.id)).then(function(data) {
      return data;
    });
  });
}

Bucket.prototype.cases = function(page, pageSize) {
  console.log("looking up cases")
  if (!Bucket.Caseblocks)
    throw "Must call Caseblocks.setup";
  var _this = this;
  return Q.fcall(function(data) {
    if (typeof page == "undefined") {
      page = 0
    }
    if (typeof pageSize == "undefined") {
      pageSize = 10
    }
    console.log(_this.case_type_code)
    console.log(page)
    console.log(pageSize)
    var url = Bucket.Caseblocks.buildUrl("/case_blocks/" + _this.case_type_code + "?bucket_id=" + _this.id + "&page=" + page + "&page_size=" + pageSize)
    console.log(url)
    return rest.get(url).then(function(data) {
      cases = []
      for (kase of data[_this.case_type_code]) {
        cases.push(new Case(kase))
      }
      return cases;
    });
  });

};

module.exports = Bucket;
