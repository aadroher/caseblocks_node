const fetch = require('node-fetch')
const inflection = require( 'inflection' );
const _ = require('underscore')

let Conversation = function(attributes) {

  this.attributes = {};

  for(let k in attributes) {
    this.attributes[k] = attributes[k];
  }

  this.id = this.attributes._id;

};

// create a new conversation
Conversation.create = function(kase, attributes) {

  let recipientsList = [];
  if (typeof(attributes.recipients) != 'undefined') {
    attributes.recipients.forEach((recipient) => {
      if (typeof(recipient)==='object') {
        recipientsList.push(recipient);
      } else {
        recipientsList.push({
          "email":recipient,
          "type":"Custom",
          "display_name":recipient
        });
      }
    })
  }

  let attachments = [];
  if (typeof(attributes.attachments)=="undefined") {
    attachments = []
  } else {
    attachments = _.map(attributes.attachments, attachment => {
      if (typeof(attachment._id) != "undefined") {
        return attachment._id
      } else if (typeof(attachment.file_name) != "undefined") {
        let doc = _.find(kase.attributes._documents,
          d => d.file_name == attachment.file_name
        )
        return doc._id
      } else {
        return null
      }
    })
  }

  attachments = _.compact(attachments)

  const conversationMessage = {
    "message": {
      "body":attributes.body,
      "case_id":kase.id,
      "subject":attributes.subject,
      "recipients":recipientsList,
      "attachments":attachments,
      author_id: attributes.author_id
    }
  };

  if (typeof(attributes.internal_template) !== 'undefined') {
    conversationMessage['internal_template'] = attributes.internal_template
  }
  if (typeof(attributes.external_template) !== 'undefined') {
    conversationMessage['external_template'] = attributes.external_template
  }

  const options = {
    method: 'post',
    body: JSON.stringify(conversationMessage)
  }

  const handleResponse = (response) => {
    if (response.ok) {
      return response.json()
    } else {
      const msg = `Status Code: ${response.status}, Status Message: ${response.statusText}`
      throw new Error(msg)
    }
  }

  const url = Conversation.Caseblocks.buildUrl("/case_blocks/messages")
  return fetch(url, options)
    .then(handleResponse)

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
