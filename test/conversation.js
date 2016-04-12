var helper = require("./spec_helper")

var should = require('chai').should(),
    Caseblocks = require('../index')

describe('conversation', function() {

  beforeEach(function() {
    this.timeout(5000);
    Caseblocks.setup("http://test-caseblocks-location", "tnqhvzxYaRnVt7zRWYhr")

    helper.nockHttp()
  });

  it("should create a new conversation on a case", function() {
    Caseblocks.Conversation.create(new Caseblocks.Case({_id: 123}), {subject: 'test1', body: 'conv-bod'}).then(function(message) {
      message.attributes.id.should.equal("321")
      done()
    }).catch(function(err){
      done(err);
    });
  })
  it("should create a new conversation on a case with recipients", function() {
    Caseblocks.Conversation.create(new Caseblocks.Case({_id: 123}), {subject: 'test1', body: 'conv-bod', recipients: ["myemail@example.com"]}).then(function(message) {
      message.attributes.id.should.equal("321")
      done()
    }).catch(function(err){
      done(err);
    });
  })
  it("should create a new conversation on a case with attachments", function() {
    Caseblocks.Conversation.create(new Caseblocks.Case({_id: 123}), {subject: 'test1', body: 'conv-bod', attachments: [{filename: "a-file.pdf"}]}).then(function(message) {
      message.attributes.id.should.equal("321")
      done()
    }).catch(function(err){
      done(err);
    });
  })



});
