var helper = require("./helpers/spec_helper")

var should = require('chai').should(),
    Caseblocks = require('../index')

describe('case', function() {

  beforeEach(function() {
    Caseblocks.setup("http://test-caseblocks-location", "tnqhvzxYaRnVt7zRWYhr")

    helper.nockHttp()
  });

  it("document should include id", function(done) {
    Caseblocks.Case.get("support_requests", "550c40d9841976debf000011").then(function(doc) {
      doc.attributes._id.should.equal("550c40d9841976debf000011")
      done();
    }).catch(function(err){
      // console.log(err);
      done(err);
    });
  });

  describe("updating", function(done) {
    it("should update a document", function(done) {
      Caseblocks.Case.get("support_requests", "550c40d9841976debf000011").then(function(doc) {
        doc.attributes._id.should.equal("550c40d9841976debf000011")
        doc.attributes.systems_involved.should.equal("1")
        doc.attributes.systems_involved = "2"
        doc.save().then(function(doc2) {
          doc2.attributes.systems_involved.should.equal("2")
          done();
        }).catch(function(err){
          done(err);
        });
      }).catch(function(err){
        done(err);
      });
    })

    it("updates multiple local values with updated calculated fields values that were not altered directly by client", function(done) {
      Caseblocks.Case.get("support_requests", "550c40d9841976debf000011").then(function(doc) {
        doc.attributes._id.should.equal("550c40d9841976debf000011")
        doc.attributes.systems_involved.should.equal("1")
        doc.attributes.systems_involved = "2"
        doc.save().then(function(returned_doc) {
          doc.attributes.systems_involved.should.equal("2")
          doc.attributes.calculated_field1.should.equal("calculated-result1")
          doc.attributes.calculated_field2.should.equal("calculated-result2")
          done();
        }).catch(function(err){
          done(err);
        });
      }).catch(function(err){
        done(err);
      });
    })
    it("does not alter local document if update fails", function(done) {
      Caseblocks.Case.get("support_requests", "550c40d9841976debf000011").then(function(doc) {
        doc.attributes.validated_field = "invalid-format"

        // adding chai-as-promised to detect failed call... need to detect error as currently no mock error being given which causes test to pass

        doc.save().should.be.rejectedWith("Error saving case").and.notify(done);

      }).catch(function(err){
        done(err);
      });

    })


  });

  it("should create a document", function(done) {
    Caseblocks.Case.create("support_requests", 42, {title: 'test1'}).then(function(doc) {
      doc.attributes.title.should.equal("test1")
      done()
    }).catch(function(err){
      done(err);
    });

  })

  it("should create a unique document", function(done) {
    Caseblocks.Case.create("support_requests", 42, {title: 'test1'}, {unique: true}).then(function(doc) {
      doc.attributes.title.should.equal("test1")
      done()
    }).catch(function(err){
      done(err);
    });
  })

  it("should search for a document and return match", function(done) {
    Caseblocks.Case.search(42, 'match-result').then(function(docs) {
      docs.length.should.to.be.above(1)
      docs[0].attributes.title.should.equal("test1")
      done()
    }).catch(function(err){
      done(err);
    });

  })

  it("should search for a document and return no matches", function(done) {
    Caseblocks.Case.search(42, 'no-match-result').then(function(docs) {
      docs.length.should.equal(0)
      done()
    }).catch(function(err){
      done(err);
    });

  })

  it ("should find related documents", function(done) {
    Caseblocks.Case.get("customers", "54524f696b949172a7000001").then(function(doc) {
      doc.related("web_enquiries", 28).then(function(related_docs) {
        related_docs.length.should.equal(1);
        related_docs[0].id.should.equal("554379ab841976f73700011c");
        done()
      }).catch(function(err) {
        done(err);
      })
    }).catch(function(err) {
      done(err);
    })

  })

  describe("participants", function() {
    it("should return a list of users", function(done) {
      Caseblocks.Case.get("customers", "54524f696b949172a7000002").then(function(doc) {
        doc.users().then(function(users) {
          users.length.should.equal(2)
          done()
        }).catch(function(err) {
          done(err);
        })
      })
    })
    it ("should return a list of teams", function(done) {
      Caseblocks.Case.get("customers", "54524f696b949172a7000002").then(function(doc) {
        doc.teams().then(function(teams) {
          teams.length.should.equal(1)
          done()
        }).catch(function(err) {
          done(err);
        })
      })
    })
    it ("should return a list of users for users and teams", function(done) {
      Caseblocks.Case.get("customers", "54524f696b949172a7000002").then(function(doc) {
        doc.participants().then(function(users) {
          users.length.should.equal(2)
          done()
        }).catch(function(err) {
          done(err);
        })
      })
    })
    it ("should return a de-duplicated list of users for participants", function(done) {
      Caseblocks.Case.get("customers", "54524f696b949172a7000002").then(function(doc) {
        doc.participants().then(function(users) {
          users.length.should.equal(2)
          users[0].display_name.should.equal("Stewart2")
          users[1].display_name.should.equal("Stewart3")
          done()
        }).catch(function(err) {
          done(err);
        })
      })
    })
  })

})
