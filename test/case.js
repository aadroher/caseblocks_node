const helper = require("./helpers/spec_helper")
const caseTestsHelper = require('./helpers/case_tests_helper')
const fetch = require('node-fetch')
const Headers = require('node-fetch').Headers
const _ = require('underscore')

const should = require('chai').should(),
      Caseblocks = require('../index')

// Mock collections
// Import collections.
const {
  caseTypes,
  people,
  weapons,
  relationships
} = require('./helpers/collections')

describe('case', function() {

  beforeEach(() => {

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

  describe("updating", function() {

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

        // Adding chai-as-promised to detect failed call...
        // need to detect error as currently no mock error being given which causes test to pass.
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

  describe("searching", function () {

    describe("using legacy behaviour", function () {

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

    })

    describe("using recommended behaviour", function () {

      beforeEach(() => {

        Caseblocks.setup("http://test-caseblocks-location", "tnqhvzxYaRnVt7zRWYhr")

      });

      it("should search for a document by non existing unique key and return no matches", function(done) {

        const personReference = people.length + 100
        caseTestsHelper.setSinglePersonSearchResult(personReference)

        const query = `person_reference:${personReference}`

        Caseblocks.Case.search('person', query)
          .then(cases => {

            cases.length.should.equal(0)
            done()

          })
          .catch(err => {

            done(err)

          })

      })

      it("should search for a document by unique key and return single match", function(done) {

        const personReference = 50
        caseTestsHelper.setSinglePersonSearchResult(personReference)

        const expectedCase = people.find(person => person.person_reference === personReference)

        const query = `person_reference:${personReference}`

        Caseblocks.Case.search('person', query)
          .then(cases => {

            cases.length.should.equal(1)

            const person = cases.pop()
            person.should.be.instanceOf(Caseblocks.Case)
            person.attributes.last_name.should.equal(expectedCase.last_name)

            done()

          })
          .catch(err => {

            done(err)

          })

      })

      it("should return a collection of cases", function(done) {

        const personReference = 2
        caseTestsHelper.setMutipleWeaponSearchResult(personReference)

        const expectedCases = weapons.filter(weapon => weapon.person_reference === personReference)

        const query = `person_reference:${personReference}`

        Caseblocks.Case.search('weapon', query)
          .then(cases => {

            cases.length.should.equal(2)

            cases.forEach(weapon => {
              weapon.should.be.instanceOf(Caseblocks.Case)
            })

            const weaponsAttributes = cases.map(weapon => weapon.attributes)

            _.isEqual(expectedCases, weaponsAttributes).should.equal(true)

            done()

          })
          .catch(err => {

            done(err)

          })

      })


      it('should return all cases with empty query string', function(done) {

        caseTestsHelper.setWithEmptyQueryString(1000)

        const emptyQueryString = ''

        Caseblocks.Case.search('person', emptyQueryString)
          .then(cases => {

            cases.length.should.equal(people.length)
            done()

          })
          .catch(err => {

            done(err)

          })

      })

    })

  })
  
  describe("on related cases", function () {
    
    describe("using legacy behaviour", function () {

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
      
    })
    
    describe("using recommended behaviour", function () {
      
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
