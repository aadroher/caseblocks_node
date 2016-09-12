var helper = require("./spec_helper")

var should = require('chai').should(),
    Task = require('../user.js'),
    Caseblocks = require('../index')

describe('team', function() {

  beforeEach(function() {
    this.timeout(5000);
    Caseblocks.setup("http://test-caseblocks-location", "tnqhvzxYaRnVt7zRWYhr")

    helper.nockHttp()

  });

  it("should find a user", function(done) {
    this.timeout(5000);

    Caseblocks.User.get("5").then(function(user) {
      user.display_name.should.equal("Back Office Mngr")
      done();
    }).catch(function(err){
      done(err);
    })

  });
  it("should get a list of members for a team", function(done) {
    this.timeout(5000);

    Caseblocks.User.getAll().then(function(users) {
      users[1].display_name.should.equal('Back Office Minion')
      users[0].display_name.should.equal('Back Office Mngr')
      done()
    }).catch(function(err){
      done(err);
    });
  });
});
