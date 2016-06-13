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

Retrieves related cases from caseblocks supplying the case type code and the id of the document.

    Caseblocks.Case.get("support_requests", "550c40d1841976debf000003").then(function(doc) {
      doc.related(related_case_type_code, relation_id).then(function(related_docs) {
        console.log(related_docs[0].id)
        console.log(related_docs[0].attributes.title)
      })
    }).catch(function(err){
      console.log(err)
    });

**teams**

Retrieves the teams that are participants in this case

    Caseblocks.Case.get("support_requests", "550c40d1841976debf000003").then(function(doc) {
      doc.teams().then(function(teams) {
        console.log(teams[0].display_name)
      })
    }).catch(function(err){
      console.log(err)
    });

**users**

Retrieves the users that are listed as an individual user as a participant on this case

    Caseblocks.Case.get("support_requests", "550c40d1841976debf000003").then(function(doc) {
      doc.users().then(function(users) {
        console.log(users[0].display_name)
      })
    }).catch(function(err){
      console.log(err)
    });

**participants**

Retrieves all the users that are participants including team members.

    Caseblocks.Case.get("support_requests", "550c40d1841976debf000003").then(function(doc) {
      doc.participants().then(function(users) {
        console.log(users[0].display_name)
      })
    }).catch(function(err){
      console.log(err)
    });



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

**tasks**

Retrieves all tasks associated with this tasklist, returns a promise with an array of tasks.

    Caseblocks.Tasklist.getAll(["550c40d9841976debf000018", "550c40d9841976debf00001a", "550c40d9841976debf00001c"]).then(function(tasklists) {
      var tasklists_returned = tasklists.length
      tasklists.forEach(function(tasklist) {
        tasklist.tasks.then(function(tasks) {
          tasks.forEach(function(task) {
            all_tasks.push(task)
          });
          tasklists_count++;
          if (tasklists_returned == tasklists_count) {
            done();
          }
        }).catch(function(err){
          done(err);
        });
      })
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


## Team

### Public Methods

**get**

Retrieves a team matching the __id__ supplied

    Caseblocks.Team.get(5).then(function(team) {
      console.log(team.display_name))
    }).catch(function(err){
      console.err(err)
    })

### Instance Methods

**members**

Retrieves the users that are members in this team.

    Caseblocks.Team.get(5).then(function(team) {
      team.members().then(function(users) {
        users.map(function(user) {
          console.log(user.display_name)
        })
      })
    }).catch(function(err){
      console.err(err)
    })

## User

### Public Methods

**get**

Retrieves a user matching the __id__ supplied

    Caseblocks.User.get(5).then(function(user) {
      console.log(user.display_name))
    }).catch(function(err){
      console.err(err)
    })


## Email

The email functions allow you to send an email either through mandrill or smtp.  You can also use the mandrill templating features.

Instantiate a new Caseblocks.Email object passing in your initial configuration, like keys and server details, then you can add recipients and setup your from address, subject, and body (html or text).

Mandrill is set as default and requires 'key' to be passed in when instantiating the object.

Other properties available are
  * serverType - 'mandrillapp' or 'smtp' values are valid.
  * smtpServer - required if serverType is smtp and is host of smtp server to use
  * key        - required if serverType is mandrill and is they access token key for your account


Example:

    var email = new Caseblocks.Email({"key": "sample-key"})
    email.to("to-address@example.com")
    email.to("second-to-address@example.com")
    email.bcc("bcc-address@example.com")
    email.from("from-address@example.com")
    email.subject("This is a sample Subject")
    email.body("<html><body style='text-align: center;'><h1>Hello World</h1></body></html>")

    email.send().then(function(result) {
      exit(result);
    })

The above example sets up the key for mandrill then adds a to address, bcc address, sets up the from address, subject and then adds an html body, then sends the email.

### Public Methods

**to(email, name)**

You can call to many times to add recipients to the email.  Name is an optional parameter.

**cc(email, name)**

You can call cc many times to add recipients to the email.  Name is an optional parameter.

**bcc(email, name)**

You can call bcc many times to add recipients to the email.  Name is an optional parameter.

**from(email, name)**

The from function, sets the from address of the email.  Again, name is optional.

**subject(text)**

Sets the subject for the email, text should be a string that will be used as the subject in the email.

**body(data)**

Sets the html body of the email, which will also automatically set the text using an html-to-text conversion tool.

**html(data)**

Alias of **body**

**text(data)**

Sets the text only version of the email.  This should be set after html as setting html overwrites this value.


**send()**

This function sends an email using either mandrill or smtp (to be implemented).  The above example shows how to setup an email before you call send.

**sendTemplate(template, data)**

Sends an email using a mandrill template.  The first parameter is a string that should match an existing mandrill template you wish to use.  The second parameter is a hash of data to be used with the template, eg

    {
      "title": "Have a merry Christmas",
      "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce aliquam mattis turpis, sit amet vestibulum justo tristique vitae. Proin."
    }

This data will then be used with the fields in the mandrill template to render the email.


## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.
