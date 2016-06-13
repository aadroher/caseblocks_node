var helper = require("./spec_helper")

var should = require('chai').should(),
    Task = require('../team.js'),
    Caseblocks = require('../index')

describe.only('team', function() {

  beforeEach(function() {
    this.timeout(5000);
    Caseblocks.setup("http://test-caseblocks-location", "tnqhvzxYaRnVt7zRWYhr")

    helper.nockHttp()

  });

  it("should find a team", function(done) {
    this.timeout(5000);

    Caseblocks.Team.get("5").then(function(team) {
      team.display_name.should.equal("Back Office Team")
      done();
    }).catch(function(err){
      done(err);
    })

  });
  it("should get a list of members for a team", function(done) {
    this.timeout(5000);

    Caseblocks.Team.get("5").then(function(team) {
      team.members().then(function(members) {
        members.length.should.equal(2)
        members[0].display_name.should.equal("Stewart2")
        members[1].display_name.should.equal("Stewart3")
        done();
      }).catch(function(err){
        done(err);
      });
    }).catch(function(err){
      done(err);
    });
  });
});
