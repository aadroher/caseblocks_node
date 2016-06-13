
//var rest = require('rest')
var rest = require('restler-q');
var inflection = require( 'inflection' );
var Conversation = require('./conversation.js');
var Document = require('./document.js');
var Casetype = require('./casetype.js');
var User = require("./user.js");
var Team = require("./team.js");
var _ = require("underscore")

var Q = require('q');

var Case = function(attributes) {
  this.attributes = {};
  for (var k in attributes) {
    this.attributes[k] = attributes[k];
  }
  this.id = this.attributes._id;
};

Case.create = function(case_type_name, case_type_id, properties, options) {
  if (!Case.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  if (typeof(options) == "undefined") {
    options = {};
  }


  var payload = {};
  properties.case_type_id = case_type_id;
  if (typeof(options.unique) !== 'undefined') {
    payload.unique = options.unique;
  }
  payload.case = properties;

  return Q.fcall(function(data) {
    return rest.postJson(Case.Caseblocks.buildUrl("/case_blocks/"+case_type_name+ ".json"), payload, {headers: {"Accept": "application/json"}}).then(function (caseData) {
      case_type_code = Object.keys(caseData)[0];
      data = caseData[case_type_code];

      kase = new Case(data);

      kase.case_type_code = case_type_code;

      return kase;
    });
    return {};
  });
};

Case.get = function(case_type_name, id) {
  if (!Case.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  var _this = new Case();
  _this.case_type_name = case_type_name;
  _this.id = id;
  return Q.fcall(function(data) {
    return rest.get(Case.Caseblocks.buildUrl("/case_blocks/"+case_type_name+"/"+id+ ".json"), {headers: {"Accept": "application/json"}}).then(function (caseData) {
      for (var k in caseData) {
        _this.case_type_code = k;
        _this.attributes = caseData[k];
      }
      return _this;
    }).fail(function(err) {
      throw err;
    });
  });
};

Case.search = function(case_type_id, query) {
  if (!Case.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  return Q.fcall(function(data) {
    return rest.get(Case.Caseblocks.buildUrl("/case_blocks/search.json?query="+query), {headers: {"Accept": "application/json"}}).then(function(data) {
      case_type_results = data.filter(function(ct) {
        return ct.case_type_id == case_type_id;
      })[0];
      if (typeof(case_type_results) != 'undefined') {
        case_type_fields = case_type_results.cases;
        return case_type_fields.map(function(d) {
          return new Case(d);
        });
      } else {
        return [];
      }
    }).fail(function(err) {
      throw err;
    });
  });
};

Case.prototype.caseType = function() {
  var _this = this;

  var caseTypeId = this.attributes.case_type_id || this.attributes.work_type_id || this.attributes.organization_type_id || this.attributes.people_type_id;

  return Casetype.get(caseTypeId);
};

Case.prototype.documents = function() {
  var _this = this;
  if (typeof(_this.attributes._documents) != "undefined") {
    return _this.attributes._documents.map(function(d) {return new Document(d, _this);} );
  } else {
    return [];
  }
};


Case.prototype.addConversation = function(subject, body, recipients, attachments) {
  if (!Case.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  var conversationData = {subject: subject, body: body, recipients: recipients, attachments};
  var conversation = Conversation.create(this, conversationData);

  return conversation;
};

Case.prototype.conversations = function() {
  if (!Case.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  throw("Not implemented yet");
};

Case.prototype.teams = function() {
  var promises = _.map(this.attributes.participating_teams, function(id){return Team.get(id);});
  return Q.allSettled(promises).then(function(returned_teams) {
    var fulfilled_teams = _.filter(returned_teams, function(t){return t.state == "fulfilled"});
    return _.map(fulfilled_teams, function(t){return t.value});
  });
};

Case.prototype.users = function() {
var promises = _.map(this.attributes.participating_users, function(id){return User.get(id);});
return Q.allSettled(promises).then(function(returned_users) {
  var fulfilled_users = _.filter(returned_users, function(u){return u.state == "fulfilled"});
  return _.map(fulfilled_users, function(u){return u.value});
});
};

Case.prototype.participants = function(options) {
  if (!Case.Caseblocks)
    throw new Error("Must call Caseblocks.setup");
  if (typeof(options)=="undefined")
    options = {};

  var _this = this;

  return Q.allSettled(
    [_this.teams().then(function(teams) {
      return Q.allSettled(
        teams.map(function(team){
          return team.members()
        })
      ).then(function(returned_users) {
          return _.filter(returned_users, function(u) {
            return u.state == "fulfilled"
          }).map(function(u) {
            return u.value
          })
      });
    }),
    _this.users()]
  ).then(function(returned_users) {
    var users = _.flatten(_.filter(returned_users, function(u) {
      return u.state == "fulfilled"
    }).map(function(u) {
      return u.value
    }))
    return _.uniq(users)
  });
 };

Case.prototype.save = function() {
  if (!Case.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

// save current data to caseblocks
  var _this = this;
  return Q.fcall(function(data) {
    payload = {};
    payload[_this.case_type_code] = _this.attributes;
    delete payload[_this.case_type_code].tasklists;
    delete payload[_this.case_type_code]._documents;
    delete payload[_this.case_type_code].version;

    return rest.putJson(Case.Caseblocks.buildUrl("/case_blocks/"+_this.case_type_name+"/"+_this.id + ".json"), payload, {headers: {"Accept": "application/json"}}).then(function(caseData) {
      for (var k in caseData) {
        _this.case_type_code = k;
        _this.attributes = caseData[k];
      }
      return _this;
    }).fail(function(err) {
      console.error(err);
      throw new Error("Error saving case");
    });
  });
};

Case.prototype.delete = function() {
  if (!Case.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  throw "Not implemented";
};

Case.prototype.related = function(related_case_type_code, relation_id) {
  if (!Case.Caseblocks) {
    throw new Error("Must call Caseblocks.setup");
  }

  path = "/case_blocks/"+related_case_type_code + ".json";
  page_size = 100000;
  page = 0;

  params = {relation_id: relation_id, relationship_type: "CaseBlocks::CaseTypeDirectRelationship", case_from_id: this.id, page_size: page_size, page:page};
  first = true;
  for(var k in params) {
    if (first)
      path += "?";
    else
      path += "&";

    first = false;

    path += "related_cases%5B"+k+"%5D="+encodeURIComponent(params[k]);
  }


  url = Case.Caseblocks.buildUrl(path);
  _this = this;
  return Q.fcall(function(data) {
    return rest.get(url, {headers: {"Accept": "application/json"}}).then(function(data) {
      return data[related_case_type_code].map(function(d) {
        return new Case(d);
      });
    }).fail(function(err) {
      throw err;
    });
  });

};


module.exports = Case;
