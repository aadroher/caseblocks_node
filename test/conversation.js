const helper = require("./helpers/spec_helper")
const nock = require("nock");

const should = require('chai').should(),
    Caseblocks = require('../index')

const caseBlocksBaseURL = 'https://test-caseblocks-location'
const authToken = "tnqhvzxYaRnVt7zRWYhr";

describe('conversation', function() {

  const messageReply = {"message":
                        {"_id":"589b1fa8d94bb18806000001",
                        "body":"conv-bod",
                        "case_id":"588b1765d94bb156f700002e",
                        "conversation_id":"589b1fa8d94bb18806000001",
                        "author_id":3,
                        "author_display_name":"Ijonas",
                        "recipients":[{"id":3,"type":"Users","display_name":"Ijonas","email":""}],
                        "subject":"test1",
                        "attachments":[],
                        "created_at":"2017-02-08T13:39:52.19201846Z",
                        "updated_at":"2017-02-08T13:39:52.19201846Z",
                        "archived_at":"0001-01-01T00:00:00Z",
                        "marked_read_at":"0001-01-01T00:00:00Z",
                        "archived_by":"",
                        "marked_read_by":""},
                        "internal_template":"","external_template":""}

  beforeEach(function() {
    this.timeout(5000);
    Caseblocks.setup(caseBlocksBaseURL, authToken)
  });



  // TODO: Properly implement this.
  it("should create a new conversation on a case"
    , function(done) {

      const verifyNock = nock(caseBlocksBaseURL, {reqheaders: {'accept': '*/*'}})
        .post('/case_blocks/messages',
            {"message":
              {"body":"conv-bod"
              ,"case_id":"588b1765d94bb156f700002e"
              ,"subject":"test1"
              ,"recipients":[]
              ,"attachments":[]}})
        .query({auth_token: authToken})
        .reply(200, messageReply)

      Caseblocks.Conversation.create(new Caseblocks.Case({_id: "588b1765d94bb156f700002e"}), {subject: 'test1', body: 'conv-bod'}).then(function(message) {
        verifyNock.done()
        done()
      }).catch(function(err){
        done(err);
      });
    }
  )

  it("should create a new conversation on a case with specific templates"
    , function(done) {

      const verifyNock = nock(caseBlocksBaseURL, {reqheaders: {'accept': '*/*'}})
        .post('/case_blocks/messages',
            {"message":
              {"body":"conv-bod"
              ,"case_id":"588b1765d94bb156f700002e"
              ,"subject":"test1"
              ,"recipients":[]
              ,"attachments":[]},
              "internal_template": "/appliance/internal_template",
              "external_template": "/appliance/external_template",
            })
        .query({auth_token: authToken})
        .reply(200, messageReply)

      Caseblocks.Conversation.create(
        new Caseblocks.Case({_id: "588b1765d94bb156f700002e"}),
        {subject: 'test1', body: 'conv-bod', "internal_template": "/appliance/internal_template", "external_template": "/appliance/external_template"}
      ).then(function(message) {
        verifyNock.done()
        done()
      }).catch(function(err){
        done(err);
      });
    }
  )


  it("should create a new conversation on a case with custom recipients"
    , function(done) {

      const verifyNock = nock(caseBlocksBaseURL, {reqheaders: {'accept': '*/*'}})
        .post('/case_blocks/messages',
            {"message":
              {"body":"conv-bod"
              ,"case_id":"588b1765d94bb156f700002e"
              ,"subject":"test1"
              ,"recipients":[{"email":"hello@hello.com","type":"Custom","display_name":"hello@hello.com"}]
              ,"attachments":[]}})
        .query({auth_token: authToken})
        .reply(200, messageReply)

      Caseblocks.Conversation.create(new Caseblocks.Case({_id: "588b1765d94bb156f700002e"}), {subject: 'test1', body: 'conv-bod', recipients: ["hello@hello.com"]}).then(function(message) {
        verifyNock.done()
        done()
      }).catch(function(err){
        done(err);
      });
    }
  )

  it("should create a new conversation on a case with internal user recipients"
    , function(done) {

      const verifyNock = nock(caseBlocksBaseURL, {reqheaders: {'accept': '*/*'}})
        .post('/case_blocks/messages',
            {"message":
              {"body":"conv-bod"
              ,"case_id":"588b1765d94bb156f700002e"
              ,"subject":"test1"
              ,"recipients":[{"id":3,"type":"Users","display_name":"Ijonas","email":"ijonas@emergeadapt.com"}]
              ,"attachments":[]}})
        .query({auth_token: authToken})
        .reply(200, messageReply)

      Caseblocks.Conversation.create(new Caseblocks.Case({_id: "588b1765d94bb156f700002e"}), {subject: 'test1', body: 'conv-bod', recipients: [{"id":3,"type":"Users","display_name":"Ijonas","email":"ijonas@emergeadapt.com"}]}).then(function(message) {
        verifyNock.done()
        done()
      }).catch(function(err){
        done(err);
      });
    }
  )


  it("should create a new conversation on a case with attachments"
    // , function() {
    //   Caseblocks.Conversation.create(new Caseblocks.Case({_id: 123}), {subject: 'test1', body: 'conv-bod', attachments: [{filename: "a-file.pdf"}]}).then(function(message) {
    //     message.attributes.id.should.equal("321")
    //     done()
    //   }).catch(function(err){
    //     done(err);
    //   });
    // }
  )

});
