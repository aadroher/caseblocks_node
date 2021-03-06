const fetch = require('node-fetch');
const htmlToText = require('html-to-text');

let Email = function(attributes) {

  const reservedFields = ["to", "cc", "bcc", "subject", "body"]

  this.serverType = "mandrillapp"
  this.format = "html"

  for(let k in attributes) {
    if (reservedFields.indexOf(k) < 0) {
      this[k] = attributes[k]
    }
  }

  // check required fields

  if (this.serverType == "mandrillapp")
    if (this.key === undefined)
      throw new Error("'key' is a required field for serverType mandrillapp")

  if (this.serverType == "smtp")
    if (this.smtpServer === undefined)
      throw new Error("smtpServer is a required field for serverType smtp")


  // setup

  this.to_addresses = []
  this.cc_addresses = []
  this.bcc_addresses = []
  this.from_address = {email: "no-reply@caseblocks.com", name: "CaseBlocks"}
  this.internal_subject = undefined
  this.internal_text = undefined
  this.internal_html = undefined

}

Email.prototype.to = function(email, name) {
  this.to_addresses.push({"email": email, "name": name})
}
Email.prototype.cc = function(email, name) {
  this.cc_addresses.push({"email": email, "name": name})
}
Email.prototype.bcc = function(email, name) {
  this.bcc_addresses.push({"email": email, "name": name})
}

Email.prototype.from = function(email, name) {
  this.from_address = {"email": email, "name": name}
}

Email.prototype.subject = function(subject) {
  this.internal_subject = subject
}

Email.prototype.text = function(textBody) {
  this.internal_text = textBody
}

Email.prototype.html = function(htmlBody) {
  this.internal_html = htmlBody
  this.internal_text = htmlToText.fromString(htmlBody, {wordwrap: 130});
}

Email.prototype.body = function(body) {
  this.html(body)
}

Email.prototype.sendTemplate = function(templateName, data, options) {
  if (options === undefined) {
    options = {}
  }
  if (this.to_addresses.length == 0) {
    throw new Error("A 'to' address is required")
  }

  const recipients = generateRecipients(this.to_addresses, this.cc_addresses, this.bcc_addresses)
  let message_data = {
    "key": this.key,
    "message": {
      "subject": this.internal_subject,
      "to": recipients
    }
  };

  message_data.template_name = templateName;

  message_data.template_content = []
  for(let k in data) {
    message_data.template_content.push({name: k, content: data[k]})
  }
  message_data.message.global_merge_vars = []
  for(let k in data) {
    message_data.message.global_merge_vars.push({name: k, content: data[k]})
  }

  message_data.message.from_email = this.from_address.email
  if (this.from_address.name !== undefined)
    message_data.message.from_name = this.from_address.name

  const requestBody = JSON.stringify(message_data)

  const requestOptions = {
    method: 'put',
    body: requestBody
  }

  const uri = "https://mandrillapp.com/api/1.0/messages/send-template.json"

  return fetch(uri, requestOptions)
    .then(response => response.text())

}

Email.prototype.send = function() {
  if (this.to_addresses.length == 0) {
    throw new Error("A 'to' address is required")
  }

  const recipients = generateRecipients(this.to_addresses, this.cc_addresses, this.bcc_addresses)
  let message_data = {
    "key": this.key,
    "message": {
      "subject": this.internal_subject,
      "to": recipients
    }
  };

  if (this.internal_html !== undefined)
    message_data.message.html = this.internal_html
  if (this.internal_text !== undefined)
    message_data.message.text = this.internal_text

  message_data.message.from_email = this.from_address.email
  if (this.from_address.name !== undefined)
    message_data.message.from_name = this.from_address.name

  const requestBody = JSON.stringify(message_data)

  const requestOptionsExtension = {
    method: 'put',
    body: requestBody,
  }

  const uri = "https://mandrillapp.com/api/1.0/messages/send.json"

  return fetch(uri, requestOptionsExtension)
    .then(response => {

      if (response.ok) {

        return response.text()

      } else {

        return response.text()
          .then(responseBody => {

            const msg = `Error: ${response.status} - ${response.statusText}\n` +
                        `Message: ${responseBody}`
            throw new Error(msg)

          })

      }

    })

}

function generateRecipients(to, cc, bcc) {
  recipients = []
  to.forEach(function(address) {
    if (address.name === undefined) {
      recipients.push({"email": address.email, "type": "to"})
    } else {
      recipients.push({"email": address.email, "name": address.name, "type": "to"})
    }
  })
  cc.forEach(function(address) {
    if (address.name === undefined) {
      recipients.push({"email": address.email, "type": "cc"})
    } else {
      recipients.push({"email": address.email, "name": address.name, "type": "cc"})
    }
  })
  bcc.forEach(function(address) {
    if (address.name === undefined) {
      recipients.push({"email": address.email, "type": "bcc"})
    } else {
      recipients.push({"email": address.email, "name": address.name, "type": "bcc"})
    }
  })
  return recipients;
}


module.exports = Email;
