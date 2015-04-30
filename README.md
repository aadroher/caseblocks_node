CaseBlocks
=========

Library of functions for interacting with the CaseBlocks API

## Installation

  npm install caseblocks --save

## Usage

    var Caseblocks = require('caseblocks')
    Caseblocks.setup("http://yourpathtocaseblocks.com:8080", "your_user_token")
    Caseblocks.Case.get("support_requests", "550c40d1841976debf000003").then(function(doc) {
      doc.attributes._id.should.equal("550c40d1841976debf000003")
      console.log("Got Case: " + doc.attributes.title )
    }).catch(function(err){
      console.log(err)
    });

## Case

### Public Methods

**create**

Creates a case document in the supplied case type (case_type_code and case_type_id) with the data supplied.

    Caseblocks.Case.create("support_requests", 42, {title: 'test1'}).then(function(doc) {
      console.log(doc.attributes.title)
    }).catch(function(err){
      console.log(err)
    });


**get**

Retrieves a case from caseblocks supplying the case type code and the id of the document.


    Caseblocks.Case.get("support_requests", "550c40d1841976debf000003").then(function(doc) {
      doc.attributes._id.should.equal("550c40d1841976debf000003")
      console.log(doc.id);
      console.log(doc.attributes.title)
    }).catch(function(err){
      console.log(err)
    });

**search**

Provides the ability to search for docuemnts and return an array of matching cases.  Each case is a Case object the same as you get from the __get__ method.

    Caseblocks.Case.search(case_type_id, 'search term').then(function(docs) {
      console.log("Found " + docs.length + " Results!")
      docs.map(function(doc) {console.log(doc.attributes.title)})
    }).catch(function(err){
      console.log(err);
    });

### Instance Methods

**save**

Saves any changes made to the current document.

    Caseblocks.Case.get("support_requests", "550c40d1841976debf000003").then(function(doc) {
      var d = new Date();
      var n = d.toUTCString();
      doc.attributes.systems_involved = n
      doc.save().then(function(doc) {
        console.log("Saved!");
      }).catch(function(err){
        console.log(err);
      });

    })

**delete**


  **Not implemented yet**

**related**


  **Not implemented yet**


## Tasklist

### Public Methods

**get**

Retrieve a tasklist matching the __id__ supplied.

    Caseblocks.Tasklist.get("550c40d1841976debf00000a").then(function(tasklist) {
      tasklist.name.should.equal("Development Tasks")
      done();
    }).catch(function(err){
      done(err);
    })


**getAll**

Retrieves multiple tasklists in one go.  Pass in an array of string id's and the matching Tasklists will be returned in an array.

    Caseblocks.Tasklist.getAll(["550c40d1841976debf00000a", "550c40d1841976debf00000c", "550c40d1841976debf00000e"]).then(function(tasklists) {
      tasklists.length.should.equal(3)
      tasklists[2].name.should.equal("Admin Tasks")
      done();
    }).catch(function(err){
      done(err);
    });

## Task

### Public Methods

**get**

Retrieves a task matching the __id__ supplied

    Caseblocks.Task.get("550c40d1841976debf000004").then(function(task) {
      task.description.should.equal("Create Pull Request")
      done();
    }).catch(function(err){
      done(err);
    })

**getAll**

Retrieves multiple tasks in one go.  Pass in an array of string id's and the matching Tasks will be returned in an array.

    Caseblocks.Task.getAll(["550c40d1841976debf000004","550c40d1841976debf000005","550c40d1841976debf000006","550c40d1841976debf000007","550c40d1841976debf000008","550c40d1841976debf000009"]).then(function(tasks) {
      tasks.length.should.equal(6)
      tasks[2].description.should.equal("Merge in Github")
      done();
    }).catch(function(err){
      done(err);
    });

## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.
