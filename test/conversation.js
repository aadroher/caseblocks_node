var helper = require("./spec_helper")

var should = require('chai').should(),
    Tasklist = require('../tasklist.js'),
    Caseblocks = require('../index')

describe('conversation', function() {

  beforeEach(function() {
    this.timeout(5000);
    Caseblocks.setup("http://test-caseblocks-location", "tnqhvzxYaRnVt7zRWYhr")

    helper.nockHttp()
  });

  it("should load a conversation")

});
