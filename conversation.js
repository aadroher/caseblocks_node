const fetch = require('node-fetch')
const Headers = require('node-fetch').Headers
const inflection = require( 'inflection' )


class Conversation {

  // Static methods
  static create(caseInstance, attributes) {

    const recipientsList = !Array.isArray(attributes.recipients) ? [] :
      attributes.recipients.map(
        recipient => (
          {
            email: attributes.recipients[recipient],
            type: "Custom",
            display_name: attributes.recipients[recipient]
          }
        )
      )

    const attachments = !Array.isArray(attributes.attachments) ? [] :
      attributes.attachments.reduce((attachmentList, attachment) => {

          if (typeof(attachment._id) != 'undefined') {

            return [...attachmentList, attachment._id]

          } else if (typeof(attachment.file_name) != 'undefined') {

            const doc = caseInstance.attributes._documents.find(
              d => d.file_name == attachment.file_name
            )

            return [...attachmentList, doc._id]

          } else {

            return attachmentList

          }

        },
        []
      )

    const conversationMessage = {
      "message": {
        "body":attributes.body,
        "case_id":caseInstance.id,
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

    const handleResponse = (response) => {

      if (response.ok) {
        return response.json()
      } else {

        const msg = `Status Code: ${response.status}, Status Message: ${response.statusText}`

        throw new Error(msg)

      }

    }

    return fetch(Conversation.Caseblocks.buildUrl("/case_blocks/messages"), options)
      .then(handleResponse)

  }

  // Instance methods
  constructor(attributes) {

    Object.keys(attributes).forEach(key => {
      this[key] = attributes[key];
    });

    this.id = this.attributes._id;

  }

  messages() {

    if (!Conversation.Caseblocks)
      throw "Must call Caseblocks.setup";

    throw("Not implemented Yet")

  }

  reply() {

    if (!Conversation.Caseblocks)
      throw "Must call Caseblocks.setup";

    throw("Not implemented Yet")

  }

}

module.exports = Conversation
