const should = require('chai').should()

const helper = require("./helpers/conversation_test_helper")

const Caseblocks = require('../index')

// Mock collections
// Import collections.
const {
  people,
  messages
} = require('./helpers/collections')

// Global constants
const caseBlocksBaseURL = 'http://test-caseblocks-location'
const authToken = 'tnqhvzxYaRnVt7zRWYhr'

describe('conversation', function() {

  describe('conversation creation', function() {

    beforeEach(function() {
      this.timeout(5000);
      Caseblocks.setup(caseBlocksBaseURL, authToken)

      helper.setConversationCreationResult()
    });

    // TODO: Properly implement this.
    it.only("should create a new conversation on a case", function(done) {

      const caseInstance = new Caseblocks.Case(people[0])
      const conversationMessage = messages[0]

      Caseblocks.Conversation.create(caseInstance, conversationMessage)
        .then(message => {
          message.attributes.id.should.equal("321")
          done()
        })
        .catch(err => {
          done(err)
        })

    })

      it("should create a new conversation on a case with recipients", function(done) {

      const caseInstance = new Caseblocks.Case(people[0])
      const conversationMessage = messages[1]

      Caseblocks.Conversation.create(caseInstance, conversationMessage)
        .then(message => {
          message.attributes.id.should.equal("321")
          done()
        })
        .catch(err => {
          done(err)
        })

    })

    it("should create a new conversation on a case with attachments", function(done) {

      const caseInstance = new Caseblocks.Case(people[0])
      const conversationMessage = messages[2]

      Caseblocks.Conversation.create(caseInstance, conversationMessage)
        .then(message => {
          message.attributes.id.should.equal("321")
          done()
        })
        .catch(err => {
          done(err)
        })

    })

  })

})
