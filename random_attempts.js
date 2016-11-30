const Caseblocks = require('./index.js')
const util = require('util')

// Account dependant constants
const caseBlocksAuthToken = 'iuW2v4Kj9BJAKUmrzwzm'
const caseBlocksAPIBaseURL = 'https://login.caseblocks.com'

const orderCaseTypeName = 'line_item'

Caseblocks.setup(caseBlocksAPIBaseURL, caseBlocksAuthToken)

const queryObject = {}

Caseblocks.Case.search(orderCaseTypeName, queryObject)
  .then(console.log)
  .catch(err => {throw err})


// The new search API expects
// curl -XPOST -H 'Content-Type: application/json' -d '{"page_size":20,"page":1,"properties": {"current_state": "Completed"}}'"https://test3.caseblocks.com/case_blocks/support%20request/search.json?auth_token=iwgbV5FGCXzwC4gqiLuR"