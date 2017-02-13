const qs = require('qs')
const fetch = require('node-fetch')

const Caseblocks = require('./index')

const baseURL = 'http://localhost:8888'
const authToken = 'kkzumKMS8sWs6gQMw_Wh'

Caseblocks.setup(baseURL, authToken)

const getURLGetQuery = (downloadURL, newFilename) =>
  qs.stringify({
    download_url: `${baseURL}${downloadURL}?auth_token=${authToken}`,
    file_name: newFilename,
    auth_token: authToken
  })



Caseblocks.Case.get('complaint', '589b07cf64e69638b8000016')
  .then(complaint0 =>
    complaint0.documents().pop()
  )
  .then(sourceDoument =>

    Caseblocks.Case.get('complaint', '589b07cf64e69638b8000014')
      .then(complaint1 =>

        sourceDoument.copyToCase(complaint1, {
          overwriteOnFound: true
        })

      )
      .then(newDocument => {

        console.log(newDocument)

      })

  )
  .catch(err => {
    console.log(err.message)
  })