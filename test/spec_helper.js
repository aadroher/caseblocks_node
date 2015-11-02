var nock = require("nock");


var nockHttp = function() {
  nock('http://test-caseblocks-location')
    .get('/case_blocks/support_requests/550c40d9841976debf000011')
    .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, {
      "support_request": {_id: '550c40d9841976debf000011', systems_involved: '1'}
     });
  nock('http://test-caseblocks-location')
    .put('/case_blocks/support_requests/550c40d9841976debf000011', {"support_request":{"_id":"550c40d9841976debf000011","systems_involved":"2"}})
    .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, {
      "support_request": {_id: '550c40d9841976debf000011', systems_involved: "2"}
     });
  nock('http://test-caseblocks-location')
    .post('/case_blocks/support_requests', {"case":{"support_requests":{"title":"test1","case_type_id":42}}})
    .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(201, {
      "support_request": {_id: '550c40d9841976debf000011', title: "test1", case_type_id: 42}
     });

  nock('http://test-caseblocks-location')
    .get('/case_blocks/search')
    .query({query: 'match-result', auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, [{case_type_id: 42, cases: [{title: "test1"}, {title: "test2"}]}]);

  nock('http://test-caseblocks-location')
    .get('/case_blocks/search')
    .query({query: 'no-match-result', auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, [{case_type_id: 42, cases: []}]);

  nock('http://test-caseblocks-location')
    .get('/case_blocks/customers/54524f696b949172a7000001')
    .query({auth_token: 'tnqhvzxYaRnVt7zRWYhr'})
    .reply(200, {_id: '554379ab841976f73700011c'});

  nock('http://test-caseblocks-location')
    .get('/case_blocks/web_enquiries')
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

  nock('http://test-caseblocks-location')
    .get("/case_blocks/tasks?ids%5B%5D=550c40d9841976debf000012&auth_token=tnqhvzxYaRnVt7zRWYhr")
    .reply(200, {tasks: [{_id: "asdf", description: "Create Pull Request"}]})


  nock('http://test-caseblocks-location')
    .get('/case_blocks/tasks?ids%5B%5D=550c40d9841976debf000012&ids%5B%5D=550c40d9841976debf000013&ids%5B%5D=550c40d9841976debf000014&ids%5B%5D=550c40d9841976debf000015&ids%5B%5D=550c40d9841976debf000016&ids%5B%5D=550c40d9841976debf000017&auth_token=tnqhvzxYaRnVt7zRWYhr')
    .reply(200, {tasks: [{_id: '550c40d9841976debf000012', asdf: "asdf"}, {_id: '550c40d9841976debf000013'}, {_id: '550c40d9841976debf000014', description: "Merge in Github", status: "not_started"}, {_id: '550c40d9841976debf000015'}, {_id: '550c40d9841976debf000016'}, {_id: '550c40d9841976debf000017'}]});

  nock('http://test-caseblocks-location')
    .get('/case_blocks/tasks?ids%5B%5D=550c40d9841976debf000019&auth_token=tnqhvzxYaRnVt7zRWYhr')
    .reply(200, {tasks: [{_id: '550c40d9841976debf000019'}]});

  nock('http://test-caseblocks-location')
    .put('/case_blocks/tasks/550c40d9841976debf000019', {"task":{"_id":"550c40d9841976debf000019","id":"550c40d9841976debf000019","status":"in_progress"}})
    .query({auth_token: "tnqhvzxYaRnVt7zRWYhr"})
    .reply(200, {tasks: [{_id: '550c40d9841976debf000019', status: "in_progress"}]});

  // tasklists

  nock('http://test-caseblocks-location')
    .get('/case_blocks/tasklists?ids%5B%5D=550c40d9841976debf000018&ids%5B%5D=550c40d9841976debf00001a&ids%5B%5D=550c40d9841976debf00001c&auth_token=tnqhvzxYaRnVt7zRWYhr')
    .reply(200, {tasklists: [{_id: '550c40d9841976debf000018', _tasks: []}, {_id: '550c40d9841976debf00001a', _tasks: []}, {_id: '550c40d9841976debf00001c', name: "Admin Tasks", _tasks: []}]});

  nock('http://test-caseblocks-location')
    .get('/case_blocks/tasklists?ids%5B%5D=550c40d9841976debf000018&auth_token=tnqhvzxYaRnVt7zRWYhr')
    .reply(200, {tasklists: [{_id: '550c40d9841976debf000018', name: "Development Tasks"}]});



}

exports.nockHttp = nockHttp;
