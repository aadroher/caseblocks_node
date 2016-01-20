var rest = require('restler-q');
var inflection = require( 'inflection' );

var Q = require('q');

var Bucket = function(attributes) {
  this.attributes = {};
  for(var k in attributes) {
    this.attributes[k] = attributes[k];
  }
  this.id = this.attributes._id;
};

Bucket.get = function(account, id) {
  return Q.fcall(function(data) {
    return rest.get(Case.Caseblocks.buildUrl("/case_blocks/buckets/" + id)).then(function(data) {
      return new Bucket(data);
    });
  });
};

Bucket.prototype.contents = function() {
  if (!Case.Caseblocks)
    throw "Must call Caseblocks.setup";
  var _this = this;
  return Q.fcall(function(data) {
    payload = _this.attributes;
    return rest.putJson(Case.Caseblocks.buildUrl("/case_blocks/buckets/" + _this.short_code + "/j")).then(function(data) {
      return data;
    });
  });

};

Bucket.prototype.save = function() {

  var _this = this;
  return Q.fcall(function(data) {
    payload = _this.attributes;
    return rest.putJson(Case.Caseblocks.buildUrl("/case_blocks/buckets/" + id), payload).then(function(data) {
      return _this;
    });
  });
};

Bucket.prototype.delete = function() {
  if (!Case.Caseblocks)
    throw "Must call Caseblocks.setup";

  var _this = this;
  return Q.fcall(function(data) {
    payload = _this.attributes;
    return rest.del(Case.Caseblocks.buildUrl("/case_blocks/buckets/" + id)).then(function(data) {
      return true;
    });
  });
};



//
// Case.search = function(case_type_id, query) {
//   if (!Case.Caseblocks)
//     throw "Must call Caseblocks.setup";
//
//   return Q.fcall(function(data) {
//     return rest.get(Case.Caseblocks.buildUrl("/case_blocks/search?query="+query)).then(function(data) {
//       case_type_fields = data.filter(function(ct) {
//         return ct.case_type_id == case_type_id
//       })[0].cases
//       return case_type_fields.map(function(d) {
//         return new Case(d)
//       })
//
//     })
//   });
// }
//
// Case.prototype.save = function() {
//   if (!Case.Caseblocks)
//     throw "Must call Caseblocks.setup";
//
// // save current data to caseblocks
//   _this = this
//   return Q.fcall(function(data) {
//     payload = {}
//     payload[_this.case_type_code] = _this.attributes
//     delete payload[_this.case_type_code].tasklists
//     delete payload[_this.case_type_code]._documents
//     return rest.putJson(Case.Caseblocks.buildUrl("/case_blocks/"+this.case_type_name+"/"+this.id), payload).then(function(data) {
//
//       return _this
//     })
//   });
// }
//
//
// Case.prototype.delete = function() {
//   if (!Case.Caseblocks)
//     throw "Must call Caseblocks.setup";
//
// }
//
// Case.prototype.related = function(related_case_type_code, relation_id) {
//   if (!Case.Caseblocks) {
//     throw "Must call Caseblocks.setup";
//   }
//
//   path = "/case_blocks/"+related_case_type_code
//   page_size = 100000
//   page = 0
//
//   params = {relation_id: relation_id, relationship_type: "CaseBlocks::CaseTypeDirectRelationship", case_from_id: this.id, page_size: page_size, page:page}
//   first = true
//   for(k in params) {
//     if (first)
//       path += "?"
//     else
//       path += "&"
//
//     first = false
//
//     path += "related_cases["+k+"]="+params[k]
//   }
//
//
//   url = Case.Caseblocks.buildUrl(path)
//   _this = this
//   return Q.fcall(function(data) {
//     return rest.get(url).then(function(data) {
//       return data[related_case_type_code].map(function(d) {
//         return new Case(d)
//       })
//     })
//   });
//
// }


module.exports = Bucket;
