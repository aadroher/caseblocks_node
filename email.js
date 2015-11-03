
//var rest = require('rest')
var rest = require('restler-q');
var inflection = require( 'inflection' );

var Q = require('q');

var Email = function(attributes) {
  this.to_addresses = []
  this.cc_addressses = []
  this.bcc_addresses = []
  this.internal_subject = ""
  this.internal_body = ""

}

Email.prototype.to = function(email, name) {
  this.to_addresses.push({"email": email, "name": name})
}
Email.prototype.cc = function(email, name) {
  this.cc_addressses.push({"email": email, "name": name})
}
Email.prototype.bcc = function(email, name) {
  this.bcc_addresses.push({"email": email, "name": name})
}



Email.prototype.send = function() {

  recipients = []
  if (addresses.constructor == String) {
    recipients.push({"email": addresses, "type": "to"})
  } else if (addresses.constructor == Array) {
    for(var i = 0; i < addresses.length; i++){
      recipients.push({"email": addresses[i], "type": "to"})
    }
  } else if (address.constructor == Object) {
    if (addresses.to !== undefined && addresses.to.constructor == Array) {
      for(var i = 0; i < addresses.to.length; i++){
        recipients.push({"email": addresses.to[i], "type": "to"})
      }
    }
    if (addresses.cc !== undefined && addresses.cc.constructor == Array) {
      for(var i = 0; i < addresses.cc.length; i++){
        recipients.push({"email": addresses.cc[i], "type": "cc"})
      }
    }
    if (addresses.bcc !== undefined && addresses.bcc.constructor == Array) {
      for(var i = 0; i < addresses.bcc.length; i++){
        recipients.push({"email": addresses.bcc[i], "type": "bcc"})
      }
    }

    var data = {
      "key": "QOEMTZUsNGUIaa1TOjsbpw",
      "message": {
        "html": htmlBody,
        "text": textBody,
        "subject": subject,
        "from_email": "no-reply@caseblocks.com",
        "from_name": "CaseBlocks",
        "to": recipients
      }
    };

    return Q.fcall(function(data) {
      return rest.putJson("https://mandrillapp.com/api/1.0/messages/send.json", data, {}).then(function(result, response) {
        if (result instanceof Error) {
          return false;
        } else {
          return true;
        }
      });
    });



  } else {
    throw "Invalid type for addresses: " + addresses.constructor.toString()
  }


  // var data = {};

  recipients = [];
  for(var i = 0; i < to.length; i ++){
    recipients.push({"email": to[i], "type": "to"})
  }

  for(var i = 0; i < cc.length; i ++){
    recipients.push({"email": cc[i], "type": "cc"})
  }

  for(var i = 0; i < bcc.length; i ++){
    recipients.push({"email": bcc[i], "type": "bcc"})
  }

  var data = {
    "key": "QOEMTZUsNGUIaa1TOjsbpw",
    "message": {
      "html": htmlBody,
      "text": textBody,
      "subject": subject,
      "from_email": "no-reply@caseblocks.com",
      "from_name": "CaseBlocks",
      "to": recipients
    }
  };

  return rest.putJson("https://mandrillapp.com/api/1.0/messages/send.json", data, {}).on('complete', function(result,response) {
    if (result instanceof Error) {
      failure(error);
    } else {
      success(result);
    }
  });


}


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
//
//
//
//     return rest.putJson(Case.Caseblocks.buildUrl("/case_blocks/"+_this.case_type_name+"/"+_this.id), payload).then(function(data) {
//
//       return _this
//     })
//   });
// }
//

module.exports = Email;
