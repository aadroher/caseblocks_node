var nock = require("nock");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var fs = require('fs');
var caseTypeData = JSON.parse(fs.readFileSync(__dirname + "/support/case-type.json").toString());
var telkom_application_case_type = JSON.parse(fs.readFileSync(__dirname + "/support/telkom-application-case-type.json").toString());

var nockHttp = function() {
  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/support_requests/550c40d9841976debf000011.json')
    .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, {
      "support_request": {_id: '550c40d9841976debf000011', systems_involved: '1'}
     });
  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .put('/case_blocks/support_requests/550c40d9841976debf000011.json', {"support_request":{"_id":"550c40d9841976debf000011","systems_involved":"2"}})
    .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, {
      "support_request": {_id: '550c40d9841976debf000011', systems_involved: "2", calculated_field1: "calculated-result1", calculated_field2: "calculated-result2"}
     });

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .put('/case_blocks/support_requests/550c40d9841976debf000011.json', {"support_request":{"_id":"550c40d9841976debf000011","systems_involved":"1","validated_field":"invalid-format"}})
    .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(400, {
      "support_request": {_id: '550c40d9841976debf000011', systems_involved: "1"}
     });

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .post('/case_blocks/support_requests.json', {"case":{"title":"test1","case_type_id":42}})
    .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(201, {
      "support_request": {_id: '550c40d9841976debf000011', title: "test1", case_type_id: 42}
     });

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
   .post('/case_blocks/support_requests.json', {"case":{"title":"test1","case_type_id":42},"unique": true})
   .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
   .reply(201, {
     "support_request": {_id: '550c40d9841976debf000011', title: "test1", case_type_id: 42}
    });

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/search.json')
    .query({query: 'match-result', auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, [{case_type_id: 42, cases: [{title: "test1"}, {title: "test2"}]}]);

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/search.json')
    .query({query: 'no-match-result', auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, [{case_type_id: 42, cases: []}]);

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/customers/54524f696b949172a7000001.json')
    .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, {_id: '554379ab841976f73700011c'});

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/web_enquiries.json')
    .query({
      "related_cases[relation_id]": 28,
      "related_cases[relationship_type]": "CaseBlocks::CaseTypeDirectRelationship",
      "related_cases[case_from_id]": "54524f696b949172a7000001",
      "related_cases[page_size]": 100000,
      "related_cases[page]": 0,
      "auth_token": "tnqhvzxYaRnVt7zRWYhr"
    })
    .reply(200, {web_enquiries: [{_id: "554379ab841976f73700011c"}]});


 // Task

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get("/case_blocks/tasks.json?ids%5B%5D=550c40d9841976debf000012&auth_token=tnqhvzxYaRnVt7zRWYhr")
    .reply(200, {tasks: [{_id: "asdf", description: "Create Pull Request"}]})


  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/tasks.json?ids%5B%5D=550c40d9841976debf000012&ids%5B%5D=550c40d9841976debf000013&ids%5B%5D=550c40d9841976debf000014&ids%5B%5D=550c40d9841976debf000015&ids%5B%5D=550c40d9841976debf000016&ids%5B%5D=550c40d9841976debf000017&auth_token=tnqhvzxYaRnVt7zRWYhr')
    .reply(200, {tasks: [{_id: '550c40d9841976debf000012', description: "asdf"}, {_id: '550c40d9841976debf000013'}, {_id: '550c40d9841976debf000014', description: "Merge in Github", status: "not_started"}, {_id: '550c40d9841976debf000015'}, {_id: '550c40d9841976debf000016'}, {_id: '550c40d9841976debf000017'}]});

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/tasks.json?ids%5B%5D=550c40d9841976debf000019&auth_token=tnqhvzxYaRnVt7zRWYhr')
    .reply(200, {tasks: [{_id: '550c40d9841976debf000019', description: "test task"}]});

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .put('/case_blocks/tasks/550c40d9841976debf000019.json', {"task":{"_id":"550c40d9841976debf000019","description":"test task","id":"550c40d9841976debf000019","status":"in_progress"}})
    .query({auth_token: "tnqhvzxYaRnVt7zRWYhr"})
    .reply(200, {tasks: [{_id: '550c40d9841976debf000019', status: "in_progress"}]});

  // tasklists

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/tasklists.json?ids%5B%5D=550c40d9841976debf000018&ids%5B%5D=550c40d9841976debf00001a&ids%5B%5D=550c40d9841976debf00001c&auth_token=tnqhvzxYaRnVt7zRWYhr')
    .reply(200, {tasklists: [{_id: '550c40d9841976debf000018', _tasks: ['550c40d9841976debf000012']}, {_id: '550c40d9841976debf00001a', _tasks: ['550c40d9841976debf000012', '550c40d9841976debf000013', '550c40d9841976debf000014', '550c40d9841976debf000015', '550c40d9841976debf000016', '550c40d9841976debf000017']}, {_id: '550c40d9841976debf00001c', name: "Admin Tasks", _tasks: ['550c40d9841976debf000019']}]});

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/tasklists.json?ids%5B%5D=550c40d9841976debf000018&auth_token=tnqhvzxYaRnVt7zRWYhr')
    .reply(200, {tasklists: [{_id: '550c40d9841976debf000018', name: "Development Tasks"}]});

  // buckets

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/buckets/6?auth_token=tnqhvzxYaRnVt7zRWYhr')
    .reply(200, {bucket: {id: '6', name:"Test Bucket"}});

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/bucket_stats/6?auth_token=tnqhvzxYaRnVt7zRWYhr')
    .reply(200, {bucket_stats: [{term: 'Not Started', count:56}], bucket_summary: {total: 56, total_in_last_24_hours: 0}});

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/another_case_type?bucket_id=6&page=0&page_size=10&auth_token=tnqhvzxYaRnVt7zRWYhr')
    .reply(200, {another_case_type: [{_id: '6', title:"Case Title"}]});


  //conversations
  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .post('/case_blocks/messages.json', {"message":{"body":"conv-body","case_id":"123","subject":"conv-subject","recipients":"conv-recipients","attachments":"conv-attachments"}})
    .reply(200, {message: [{_id: '550c40d9841976debf000018', text: "Development Tasks"}]});

  // mandrillapp

  nock('https://mandrillapp.com')
    .put("/api/1.0/messages/send.json", { key: 'valid-mandrill-key', message: { subject: 'Test Email', from_email: 'stewart@emergeadapt.com', from_name: 'CaseBlocks', to: [ {"email":"stewart@theizone.co.uk","type":"to"} ], html: 'test content', text: 'test content' }})
    .reply(200, "success-mandrill-response")

  nock('https://mandrillapp.com')
    .put("/api/1.0/messages/send.json", { key: 'valid-mandrill-key', message: { subject: 'Simulate Error', from_email: 'stewart@emergeadapt.com', from_name: 'CaseBlocks', to: [ {"email":"stewart@theizone.co.uk","type":"to"} ], html: 'test content', text: 'test content' }})
    .reply(500, "failure-mandrill-response")

  nock('https://mandrillapp.com')
    .put("/api/1.0/messages/send-template.json", {key:"valid-mandrill-key",message:{subject:"Simulate Success",to:[{email:"stewart@theizone.co.uk",type:"to"}],global_merge_vars:[{name:"title",content:"Test Name"},{name:"productName",content:"product name in email"}],from_email:"stewart@emergeadapt.com"},template_name:"test-template",template_content:[{name:"title",content:"Test Name"},{name:"productName",content:"product name in email"}]})
    .reply(200, "success-mandrill-template-response")


  // case type

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/case_types/15.json')
    .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, caseTypeData)

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/case_types/22.json')
    .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, telkom_application_case_type)

  // documents

  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .get('/case_blocks/support_requests/case-with-documents.json')
    .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, {
      "support_request": {_id: 'case-with-documents', systems_involved: '1', "_documents": [{
          "content_type": "application/pdf",
          "size": "2952201",
          "extension": "pdf",
          "uploaded_at": "2016-05-17T10:49:37.179Z",
          "pages": [{
            "page_no": 1,
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-0.jpg?ignoreOnTimeline=true"
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-1.jpg?ignoreOnTimeline=true",
            "page_no": 2
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-2.jpg?ignoreOnTimeline=true",
            "page_no": 3
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-3.jpg?ignoreOnTimeline=true",
            "page_no": 4
          }, {
            "page_no": 5,
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-4.jpg?ignoreOnTimeline=true"
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-5.jpg?ignoreOnTimeline=true",
            "page_no": 6
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-6.jpg?ignoreOnTimeline=true",
            "page_no": 7
          }],
          "_id": "573af74181e9a82979000008",
          "file_name": "old-filename.pdf",
          "url": "/documents/2/22/573af72681e9a8296f000023/old-filename.pdf"
        }],
        "application_pdf": {
          "file_name": "old-filename.pdf",
          "url": "/documents/2/22/573af72681e9a8296f000023/old-filename.pdf",
          "content_type": "application/pdf",
          "size": "2952201",
          "extension": "pdf",
          "uploaded_at": "2016-05-17T10:49:37.179Z",
          "used_as_attachment": false,
          "pages": [{
            "page_no": 1,
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-0.jpg?ignoreOnTimeline=true"
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-1.jpg?ignoreOnTimeline=true",
            "page_no": 2
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-2.jpg?ignoreOnTimeline=true",
            "page_no": 3
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-3.jpg?ignoreOnTimeline=true",
            "page_no": 4
          }, {
            "page_no": 5,
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-4.jpg?ignoreOnTimeline=true"
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-5.jpg?ignoreOnTimeline=true",
            "page_no": 6
          }, {
            "url": "/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-6.jpg?ignoreOnTimeline=true",
            "page_no": 7
          }],
          "status": null,

        },
        "work_type_id": 22
        }
     });

     nock('http://test-caseblocks-location')
       .put('/documents/2/22/573af72681e9a8296f000023/old-filename.pdf', "new_file_name=new-filename.pdf")
       .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
       .reply(200, {"file_name":"new-filename.pdf","url":"/documents/2/22/573af72681e9a8296f000023/new-filename.pdf"});

     nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
       .put('/case_blocks/support_requests/case-with-documents.json',  {"support_request":{"_id":"case-with-documents","systems_involved":"1","application_pdf":{"file_name":"new-filename.pdf","url":"/documents/2/22/573af72681e9a8296f000023/new-filename.pdf","content_type":"application/pdf","size":"2952201","extension":"pdf","uploaded_at":"2016-05-17T10:49:37.179Z","used_as_attachment":false,"pages":[{"page_no":1,"url":"/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-0.jpg?ignoreOnTimeline=true"},{"url":"/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-1.jpg?ignoreOnTimeline=true","page_no":2},{"url":"/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-2.jpg?ignoreOnTimeline=true","page_no":3},{"url":"/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-3.jpg?ignoreOnTimeline=true","page_no":4},{"page_no":5,"url":"/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-4.jpg?ignoreOnTimeline=true"},{"url":"/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-5.jpg?ignoreOnTimeline=true","page_no":6},{"url":"/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-6.jpg?ignoreOnTimeline=true","page_no":7}],"status":null},"work_type_id":22}})
       .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
       .reply(200, {"support_request": {_id: '550c40d9841976debf000011', systems_involved: "2", calculated_field1: "calculated-result1", calculated_field2: "calculated-result2"}});
}

exports.nockHttp = nockHttp;
exports.expect = chai.expect;
