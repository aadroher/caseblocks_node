CaseBlocks
=========

Library of functions for interacting with the CaseBlocks API

## Installation

  npm install caseblocks --save

## Usage

    var Caseblocks = require('caseblocks')
    Caseblocks.setup("http://yourpathtocaseblocks.com:8080", "your_user_token")
    Caseblocks.Case.get("support_requests", "550c40d1841976debf000003").then(function(doc) {
      doc.attributes._id.should.equal("550c40d1841976debf000003")
      console.log("Got Case: " + doc.attributes.title )
    }).catch(function(err){
      console.log(err)
    });

    



## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.
