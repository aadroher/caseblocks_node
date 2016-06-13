var rest = require('restler-q');
var inflection = require( 'inflection' );
var _ = require('underscore')

var Q = require('q');

var Conversation = function(attributes) {
  this.attributes = {};
  for(var k in attributes) {
    this.attributes[k] = attributes[k];
  }
  this.id = this.attributes._id;
};

// create a new conversation
Conversation.create = function(kase, attributes) {
  var recipientsList = [];
    if (typeof(attributes.recipients) != 'undefined') {
      for (recipient in attributes.recipients){
        recipientsList.push({"email":attributes.recipients[recipient],"type":"Custom","display_name":attributes.recipients[recipient]});
    }
  }
  var attachments = [];

  if (typeof(attributes.attachments)=="undefined") {
    attachments = []
  } else {
    attachments = _.map(attributes.attachments, function(attachment) {
      if (typeof(attachment._id) != "undefined") {
        return attachment._id
      } else if (typeof(attachment.file_name) != "undefined") {
        var doc = _.find(kase.attributes._documents, function(d) { return d.file_name == attachment.file_name } )
        return doc._id
      } else {
        return null
      }
    })
  }

  attachments = _.compact(attachments)

  var conversationMessage = {"message":{"body":attributes.body,"case_id":kase.id,"subject":attributes.subject,"recipients":recipientsList,"attachments":attachments, author_id: attributes.author_id}};

  return Q.fcall(function(data) {
    return rest.postJson(Conversation.Caseblocks.buildUrl("/case_blocks/messages.json"), conversationMessage, {headers: {"Accept": "application/json"}}).then(function (message) {
        // return new Message(message);
        return message;
    }).fail(function(err) {
      throw err;
    });
  });
}

Conversation.prototype.messages = function() {
  if (!Case.Caseblocks)
    throw "Must call Caseblocks.setup";

  throw("Not implemented Yet")
}

Conversation.prototype.reply = function(message, recipients, attachments) {
  if (!Case.Caseblocks)
    throw "Must call Caseblocks.setup";

  throw("Not implemented Yet")
}


module.exports = Conversation;
