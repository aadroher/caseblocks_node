const fetch = require('node-fetch')
const Headers = require('node-fetch').Headers
const inflection = require( 'inflection' );
const _ = require('underscore')

function requestOptions(options={}) {

  const defaultHeaders = new Headers({
    'Accept': 'application/json'
  })

  const defaultOptions = {
    headers: defaultHeaders
  }

  return Object.assign(defaultOptions, options)

}

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

    for (let recipient in attributes.recipients){

      recipientsList.push({
        "email":attributes.recipients[recipient],
        "type":"Custom",
        "display_name":attributes.recipients[recipient]
      });

    }

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

  const options = {
    method: 'post',
    body: JSON.stringify(conversationMessage)
  }

  return fetch(Conversation.Caseblocks.buildUrl("/case_blocks/messages"), options)
    .then(response => response.json())

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
