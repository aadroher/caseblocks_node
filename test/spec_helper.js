var nock = require("nock");
var chai = require("chai");
var fs = require("fs");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var caseTypeData = JSON.parse(fs.readFileSync("./test/support/case-type.json", "utf8"));
var telkom_application_case_type = JSON.parse(fs.readFileSync("./test/support/telkom-application-case-type.json", "utf8"));

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
    .get('/case_blocks/customers/54524f696b949172a7000002.json')
    .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, {support_request: {_id: '554379ab841976f73700011c', participating_teams: [5], participating_users: [6, 11]}});

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


  nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
    .post("/case_blocks/support_requests.json",  {"unique":true,"case":{"title":"test1","case_type_id":42}})
    .query({auth_token: "tnqhvzxYaRnVt7zRWYhr"})
    .reply(200, {"case": {title: "test1"}})


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
       .query({new_file_name: "new-filename.pdf", auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
       .reply(200, "{\"file_name\":\"new-filename.pdf\",\"url\":\"/documents/2/22/573af72681e9a8296f000023/new-filename.pdf\"}");

     nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
       .put('/case_blocks/support_requests/case-with-documents.json',  {"support_request":{"_id":"case-with-documents","systems_involved":"1","application_pdf":{"file_name":"new-filename.pdf","url":"/documents/2/22/573af72681e9a8296f000023/new-filename.pdf","content_type":"application/pdf","size":"2952201","extension":"pdf","uploaded_at":"2016-05-17T10:49:37.179Z","used_as_attachment":false,"pages":[{"page_no":1,"url":"/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-0.jpg?ignoreOnTimeline=true"},{"url":"/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-1.jpg?ignoreOnTimeline=true","page_no":2},{"url":"/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-2.jpg?ignoreOnTimeline=true","page_no":3},{"url":"/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-3.jpg?ignoreOnTimeline=true","page_no":4},{"page_no":5,"url":"/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-4.jpg?ignoreOnTimeline=true"},{"url":"/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-5.jpg?ignoreOnTimeline=true","page_no":6},{"url":"/documents/2/22/573af72681e9a8296f000023/2016050515064627.pdf-x512-6.jpg?ignoreOnTimeline=true","page_no":7}],"status":null},"work_type_id":22}})
       .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
       .reply(200, {"support_request": {_id: '550c40d9841976debf000011', systems_involved: "2", calculated_field1: "calculated-result1", calculated_field2: "calculated-result2"}});


    // TEAMS

    nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
      .get('/case_blocks/teams/5')
      .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
      .reply(200, {"team": {"id": 5, "display_name": "Back Office Team", "exclude_from_distribution": false, "include_in_distribution": false, "created_at": "2015-11-16T13:23:09.000Z", updated_at: "2016-05-31T15:05:59.000Z", "account_id": 2, "team_screen_enabled": false, "users_length": 3, "team_membership_ids": ["6"]}});

    nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
      .get('/case_blocks/users/6')
      .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
      .reply(200, {"user":{"id":6,"display_name":"Stewart2","login":"stewart","email":"stewart2@emergeadapt.com","created_at":"2015-11-16T13:23:08.000Z","updated_at":"2016-06-10T15:36:43.000Z","is_account_admin":true,"is_app_admin":true,"account_id":2,"presence_status":"Available","last_seen":"2016-06-10T15:36:43.000Z","avatar_url":"/users/avatar/2/6/Document-2013-11-11-09-19-09.jpg","accountId":2,"case_count":1762,"team_membership_ids":[4,12],"flagged_case_ids":["5527d184cff45548a50000d0","573d90e281e9a8a220000004"],"flagged_bucket_ids":[7,10,11,2,20,16],"team_memberships_length":2,"accessible_resources":[1,2,3,4,5,6,12,13,17,18,19,20,21,22,34,35,38,39,40,41,42,43,51,52,56,57,58,59,60,61,65,66,67,68,69,70,71,72,83,84,87,88,89,90,91,92,97,98,99,100,101,102,103,104,109,110,111,113,114,116,118,120,123,125,166,167,168,170,172,173,176,178,350,351,353,355,357,359,362,364,610,611,612,614,615,617,619,621,634,636,637,641,649,654,667,671,1011,1012,1013,1014,1015,1016,1017,1018,1043,1045,1047,1049,1051,1053,1055,1057,1136,1137,1138,1139,1140,1141,1142,1143,3141,3143,3145,3147,3149,3151,3153,3155,3194,3196,3198,3200,3202,3204,3206,3208,3459,3460,3462,3464,3465,3468,3470,3472,4127,4128,4130,4132,4134,4136,4139,4141],"authentication_token":"KFLQkX7VC-Sztpjdm1yr"}});

    nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
      .get('/case_blocks/users/11')
      .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
      .reply(200, {"user":{"id":11,"display_name":"Stewart3","login":"stewart","email":"stewart3@emergeadapt.com","created_at":"2015-11-16T13:23:08.000Z","updated_at":"2016-06-10T15:36:43.000Z","is_account_admin":true,"is_app_admin":true,"account_id":2,"presence_status":"Available","last_seen":"2016-06-10T15:36:43.000Z","avatar_url":"/users/avatar/2/6/Document-2013-11-11-09-19-09.jpg","accountId":2,"case_count":1762,"team_membership_ids":[4,12],"flagged_case_ids":["5527d184cff45548a50000d0","573d90e281e9a8a220000004"],"flagged_bucket_ids":[7,10,11,2,20,16],"team_memberships_length":2,"accessible_resources":[1,2,3,4,5,6,12,13,17,18,19,20,21,22,34,35,38,39,40,41,42,43,51,52,56,57,58,59,60,61,65,66,67,68,69,70,71,72,83,84,87,88,89,90,91,92,97,98,99,100,101,102,103,104,109,110,111,113,114,116,118,120,123,125,166,167,168,170,172,173,176,178,350,351,353,355,357,359,362,364,610,611,612,614,615,617,619,621,634,636,637,641,649,654,667,671,1011,1012,1013,1014,1015,1016,1017,1018,1043,1045,1047,1049,1051,1053,1055,1057,1136,1137,1138,1139,1140,1141,1142,1143,3141,3143,3145,3147,3149,3151,3153,3155,3194,3196,3198,3200,3202,3204,3206,3208,3459,3460,3462,3464,3465,3468,3470,3472,4127,4128,4130,4132,4134,4136,4139,4141],"authentication_token":"KFLQkX7VC-Sztpjdm1yr"}});

    nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
      .get('/case_blocks/team_memberships')
      .query({"ids[]": 6, auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
      .reply(200, {"team_memberships":[{"id":6,"user_id":6,"team_id":5,"leader":null}]});

    // BUCKETS

    nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
      .get('/case_blocks/buckets/6')
      .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
      .reply(200, {"bucket":{"id":6,"name":"Test Bucket","description":"All Bulk Uplift","short_code":"All","default":true,"kpi":"current_state","advanced_query":"","created_at":"2015-11-16T13:23:10.000Z","work_type_id":3,"work_type":3,"case_type":{"id":3,"type":"case_type"},"case_type_name":"Bulk Uplift","bucket_members":[1,2,3],"owner":{"id":9,"type":"user"},"owned_by_id":9,"owned_by_type":"CaseBlocks::User","bucket_groups":[],"bucket_criterias":[],"bucket_display_fields":[],"bucket_sort_fields":[],"bucket_alarms":[]}})

    nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
      .get('/case_blocks/bucket_stats/6')
      .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
      .reply(200, {"bucket_stats":[{"term":"Not Started","count":56},{"term":"New","count":2}],"bucket_summary":{"total":56,"total_in_last_24_hours":0}})

    nock('http://test-caseblocks-location', {reqheaders: {'accept': 'application/json'}})
      .get('/case_blocks/another_case_type')
      .query({bucket_id: 6, page: 0, page_size: 10, auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
      .reply(200, {"another_case_type":[{"_id":"5729b6e781e9a8b8f7000001","employee_number":"RP1","number_of_applications":1,"number_of_payments":null,"number_of_leads":null,"telkom":false,"cell_c":false,"four_paws":false,"breadline":false,"full_name":"Stewart McKee","first_name":null,"last_name":null,"gender":null,"cell_number":null,"email_address":null,"address":null,"identification_number":null,"passport_number":null,"data_card":null,"size":null,"leads_portal_password":null,"latitude":null,"longitude":null,"title":"Stewart McKee","office_reference":null,"agent_reference":1,"employee_sequence":1,"schema_version":4,"created_at":"2016-05-04T08:46:31.959Z","updated_at":"2016-06-08T14:08:28.186Z","due_at":"2016-05-04T08:46:31.951Z","owner_name":"Stewart2","unread_conversations":0,"current_state":"Not Started","case_type":"Agent","current_state_id":81,"owned_by_id":6,"owned_by_type":"CaseBlocks::User","_title":"Stewart McKee","participating_users":[6],"account_id":2,"participating_teams":[],"version":4,"_documents":[],"collection":null,"notes":"## Stewart McKee","conversations":[],"tasklists":[],"people_type_id":24},{"_id":"5729e4d881e9a8b8f7000017","employee_number":"RP2","number_of_applications":0,"number_of_payments":null,"number_of_leads":null,"telkom":false,"cell_c":false,"four_paws":false,"breadline":false,"full_name":null,"first_name":null,"last_name":null,"gender":null,"cell_number":null,"email_address":null,"address":null,"identification_number":null,"passport_number":null,"data_card":null,"size":null,"leads_portal_password":null,"latitude":null,"longitude":null,"title":null,"office_reference":null,"agent_reference":2,"employee_sequence":2,"schema_version":4,"created_at":"2016-05-04T12:02:32.103Z","updated_at":"2016-05-04T12:02:32.103Z","due_at":"2016-05-04T12:02:32.095Z","owner_name":"Stewart2","unread_conversations":0,"current_state":"Not Started","case_type":"Agent","current_state_id":81,"owned_by_id":6,"owned_by_type":"CaseBlocks::User","participating_users":[6],"account_id":2,"participating_teams":[],"version":1,"_documents":[],"collection":null,"conversations":[],"tasklists":[],"people_type_id":24}]})



}

exports.nockHttp = nockHttp;
exports.expect = chai.expect;
