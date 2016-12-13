const Caseblocks = require('./index.js')
const util = require('util')

// Account dependant constants
// const caseBlocksAuthToken = 'iuW2v4Kj9BJAKUmrzwzm'
const caseBlocksAuthToken = 'dwHK6481mt5tg3UFExoq'
const caseBlocksAPIBaseURL = 'https://test3.caseblocks.com'
// const caseBlocksAPIBaseURL = 'http://localhost:8888'

const caseTypeName = 'configuration_item'
const caseTypeId = 58

Caseblocks.setup(caseBlocksAPIBaseURL, caseBlocksAuthToken)

const query = 'priority:High'

Caseblocks.Case.search(caseTypeName, query)
  .then(cases =>
    cases.pop().relatedByName('client')
  )
  // .then(results => console.log(util.inspect(results, {depth: null})))
  .then(console.log)
  .catch(err => {
    console.log(err.message)
  })


// The new search API expects
// curl -XPOST -H 'Content-Type: application/json' \
// -d '{"page_size":20,"page":1,"properties": {"current_state": "Complete"}}' \
// "http://localhost:8888/case_blocks/claim/search.json?auth_token=o9hi8vBi8yXiBuiWq9rP"

// curl -XGET -H 'Content-Type: application/json' \
// "http://localhost:8888/case_blocks/search.json?query=current_state:Complete&auth_token=QPZjHZgzhohuoM5Y5yHs"

// var x =
//   [
//     {
//       relationship: {
//         id: 530,
//         from_fieldset_key: 'internal_references',
//         to_fieldset_key: 'client_references',
//         position: 1,
//         to_organization_type_id: 161,
//         from_work_type_id: 162,
//         fields: [3853, 3854, 3855, 3856, 3857, 3858],
//         from_key: 'client_reference',
//         to_key: 'client_reference'
//       },
//       cases: [ Case {
//         attributes: {
//           _id: '578f5f5dd3144224e30008f0',
//           support_requests: 18,
//           feature_requests: 9,
//           configuration_items: 22,
//           client_name: 'Lumegent',
//           primary_contact: 'Billy Thompson',
//           phone_number: null,
//           mobile_number: null,
//           email_address: 'bthompson@lumegent.com',
//           address_line_1: '625 W Williams Ave',
//           address_line_2: 'Fallon',
//           address_line_3: 'Nevada',
//           address_line_4: null,
//           postcode: '89406',
//           country: 'USA',
//           client_reference: 7,
//           title: 'Lumegent',
//           schema_version: 12,
//           created_at: '2016-07-20T11:24:13.352Z',
//           updated_at: '2016-10-19T14:41:25.652Z',
//           due_at: '2016-07-20T11:24:13.342Z',
//           owner_name: 'Euan McCreath',
//           unread_conversations: 0,
//           current_state: 'Active',
//           case_type_id: 161,
//           case_type: 'Client',
//           current_state_id: 723,
//           owned_by_id: 208,
//           owned_by_type: 'CaseBlocks::User',
//           _title: 'Lumegent',
//           participating_users: [208],
//           account_id: 1,
//           participating_teams: [1, 198],
//           version: 16,
//           _documents: [{
//             content_type: 'image/png',
//             size: '24320',
//             extension: 'png',
//             uploaded_at: '2016-10-11T11:47:26.870Z',
//             pages: [{
//               page_no: 1,
//               url: '/documents/1/161/578f5f5dd3144224e30008f0/lumgentlogo.png-x512.jpg?ignoreOnTimeline=true'
//             }],
//             _id: '57fcd14e55423100050000eb',
//             file_name: 'lumgentlogo.png',
//             url: '/documents/1/161/578f5f5dd3144224e30008f0/lumgentlogo.png'
//           }],
//           collection: null,
//           client_lead: {
//             _id: {'$oid': '56ba16c707775802af00001a'},
//             employee_reference: 1,
//             first_name: 'Euan',
//             last_name: 'McCreath',
//             email_address: 'euan@emergeadapt.com'
//           },
//           client_rag_status: 'MARCOM Integration has been completed (artwork and packing slips todo).  Ongoing enhancements to ensure all orders have correct invoicing details are in progress.  Orders from the 21st of September onwards have been imported and are ready for processing.  Product Catalogue definitions need updated by Lumegent. EM',
//           employee_reference: 1,
//           client_logo: {
//             file_name: 'lumgentlogo.png',
//             url: '/documents/1/161/578f5f5dd3144224e30008f0/lumgentlogo.png',
//             content_type: 'image/png',
//             size: '24320',
//             extension: 'png',
//             uploaded_at: '2016-10-11T11:47:26.870Z',
//             used_as_attachment: false,
//             pages: [{
//               page_no: 1,
//               url: '/documents/1/161/578f5f5dd3144224e30008f0/lumgentlogo.png-x512.jpg?ignoreOnTimeline=true'
//             }],
//             status: null
//           },
//           client_primary_colour: '#f8ba01',
//           client_report_distribution_list: [{
//             recipient_name: 'Alison Fenimore',
//             recipient_email_address: 'afenimore@lumegent.com'
//           },
//             {
//               recipient_name: 'Billy Thompson',
//               recipient_email_address: 'bthompson@lumegent.com'
//             },
//             {
//               recipient_name: 'Sarah Murray',
//               recipient_email_address: 'smurray@lumegent.com'
//             }],
//           conversations: [],
//           tasklists: ['578f5f5dd3144224e30008f2'],
//           tasks: ['578f5f5dd3144224e30008f1']
//         },
//         id: '578f5f5dd3144224e30008f0'
//       }]
//     }]