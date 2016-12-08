const Caseblocks = require('./index.js')
const util = require('util')

// Account dependant constants
// const caseBlocksAuthToken = 'iuW2v4Kj9BJAKUmrzwzm'
const caseBlocksAuthToken = 'sswwxuWt8oLTbvkPaMv8'
// const caseBlocksAPIBaseURL = 'https://login.caseblocks.com'
const caseBlocksAPIBaseURL = 'http://localhost:8888'

const caseTypeName = 'customer'

Caseblocks.setup(caseBlocksAPIBaseURL, caseBlocksAuthToken)

const query = 'current_state:*'

Caseblocks.Case.search(caseTypeName, query)
  .then(cases =>
    cases.pop().related('claim')
  )
  .then(results => console.log(util.inspect(results, {depth: null})))
  .catch(err => {console.log(err.message)})


// The new search API expects
// curl -XPOST -H 'Content-Type: application/json' \
// -d '{"page_size":20,"page":1,"properties": {"current_state": "Complete"}}' \
// "http://localhost:8888/case_blocks/claim/search.json?auth_token=o9hi8vBi8yXiBuiWq9rP"

// curl -XGET -H 'Content-Type: application/json' \
// "http://localhost:8888/case_blocks/search.json?query=current_state:Complete&auth_token=QPZjHZgzhohuoM5Y5yHs"