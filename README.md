CaseBlocks
=========

The `caseblocks` NPM package is a library to interact with the [CaseBlocks](http://www.emergeadapt.com/) REST API.

It assumes that it will be executed in a _Node.js_ envirnoment.

## Installation

As with any NPM package:

`npm install caseblocks --save`

## Initialization

The `Caseblocks` object, which is the main proxy with the Caseblocks REST API, has to first be initialized with the proper parameters: 

```javascript
const Caseblocks = require('caseblocks')

Caseblocks.setup("http://yourpathtocaseblocks.com:8080", "your_user_token")
```

The user token may be found in the _User settings_ section of the Caseblocks web interface. 

## CaseType

### Constructor

#### `new Caseblocks.Casetype(attributes)`

- arguments:

  - `{object} attributes`  The attributes of the case type to create

- returns: `{Casetype}` The instance of `Casetype`

  ​

### Class Methods

#### `Casetype.get(caseTypeId)`

- arguments:
  - `{string} caseTypeId`  the `id`  (primary key) attribute of a case type.
- returns: `{Promise.<Case>} `

Gets the case type from the server and returns the casetype object.

```javascript
Caseblocks.Casetype.get("15").then(function(casetype) {
  console.log(casetype.id)
}).catch(function(err){
  console.error(err);
});
```

### Instance Methods

#### `fieldsOfType(fieldType)`

Returns all the field objects in the casetype of the specified type, for example 'documents'.

```javascript
Caseblocks.Casetype.get("15").then(function(casetype) {
  documentFields = casetype.fieldsOfType('document')
  console.log(documentFields)
}).catch(function(err){
  console.error(err);
});
```


## Case

### Class Methods

#### `create(caseTypeCode, caseTypeId, caseData)`

- arguments:
  - `{string} caseTypeCode`  The plural underscored name of the case type this case will belong to.
  - `{number|string} caseTypeId`  The id of the case type this case will belong to.
  - `{object} caseData` The attributes this case will have.
- returns: `{Promise.<Case>}`

Creates a case document in the supplied case type (`case_type_code` and `case_type_id`) with the data supplied.

```javascript
Caseblocks.Case.create("support_requests", 42, {title: 'test1'})
    .then(function(doc) {
      console.log(doc.attributes.title)
    }).catch(function(err){
      console.error(err)
    });
```

#### `get(caseTypeCode, caseId)`

- arguments:
  - `{string} caseTypeCode`  The plural underscored name of the case type this case belongs to.
  - `{string} caseId`  The primary key for the case. As of today it is an instance of `mongodb.ObjectId` from the [MongoDB](https://www.npmjs.com/package/mongodb) NPM package.
- returns `{Promise.<Case>}`

Retrieves a case from caseblocks supplying the case type code and the id of the document.

```javascript
Caseblocks.Case.get("support_requests", "550c40d1841976debf000003")
    .then(function(doc) {
      doc.attributes._id.should.equal("550c40d1841976debf000003")
      console.log(doc.id);
      console.log(doc.attributes.title)
    }).catch(function(err){
      console.error(err)
    });
```

#### `search(caseTypeRepresentation, query)`

This function provides the ability to search for documents and return an array of matching cases. As of version 1.2.0 it has **two different usages** depending on the nature of the arguments passed:

##### Legacy usage

**WARNING**: This way of usign it is **deprecated** and will eventually be removed.

- arguments:
  - `{string|number} caseTypeRepresentation` The id of the case type that we want to search instances of.
  - `{string} searchQuery ` A search query following the [_Elasticsearch_ string query mini language syntax](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax).
- returns `{Promise.<[Case]>}` An array of `Case` instances which are  the same as you get from the `get` method. The length of the resulting `[Case]` array is **limited to 10 elements**.  

```javascript
Caseblocks.Case.search(31416, 'full_name:"Rick Sanchez" AND dimension:"C-137"')
  .then(results => {
    console.log("Found " + results.length + " cases!")
    resulsts.map(caseInstance => {
      console.log(caseInstance.attributes.title)
    })
  })
  .catch(err => {
    console.error(err.message)
  })
```

##### Recomended usage

A new, more convenient way of searching cases uses the following signarture:

-  arguments:
   -  `{string} caseTypeRepresentation` The singular underscored name of the case type we want to search instances of.
   -   `{string} searchQuery ` A search query following the [_Elasticsearch_ string query mini language syntax](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax).
-  returns `{Promise.<[Case]>}` An array of `Case` instances which are  the same as you get from the `get` method. There is no limit on the number of cases retrieved.

```{javascript}
Caseblocks.Case.search('mad_scientists', 'full_name:"Rick Sanchez" AND dimension:"C-137"')
  .then(results => {
    console.log("Found " + results.length + " cases!")
    resulsts.map(caseInstance => {
      console.log(caseInstance.attributes.title)
    })
  })
  .catch(err => {
    console.error(err.message)
  })
```



#### `save()`

Saves any changes made to the current case object.

```javascript
Caseblocks.Case.get("support_requests", "550c40d1841976debf000003")
    .then(function(doc) {
      var d = new Date();
      var n = d.toUTCString();
      doc.attributes.systems_involved = n
      doc.save().then(function(doc) {
        console.log("Saved!");
      }).catch(function(err){
        console.error(err);
      });
    });
```

#### `delete()`

  **Not implemented yet**

#### `related(relatedCaseTypeCode, relationshipId)`

Retrieves related cases from caseblocks supplying the case type code and the id of the document.

```javascript
Caseblocks.Case.get("support_requests", "550c40d1841976debf000003")
    .then(function(doc) {
      doc.related(related_case_type_code, relation_id)
        .then(function(related_docs) {
            console.log(related_docs[0].id)
            console.log(related_docs[0].attributes.title)
          })
    }).catch(function(err){
      console.log(err)
    });
```

#### `relatedByName(relatedCaseTypeCode)`

- arguments:

  - `{string} relatedCaseTypeCode` The singular underscored name of the case type we want to search instances of.

- returns: `{Promise.<[object]>}`  A promise that resolves into an array of objects, one for each different relationship for which there are cases of the type that corresponds to `relatedCaseTypeCode`.  It has the following internal structure:

  ```javascript
  [ 
    { 
      relationship_0: { 
        id: 530,
        from_fieldset_key: 'field_set_name_0',
        to_fieldset_key: 'field_set_name_1',
        position: 1,
        to_organization_type_id: 161,
        from_work_type_id: 162,
        // ...
        from_key: 'field_name_0',
        to_key: 'field_name_1' 
     	 },
     	cases: [ 
        case_00,
        // ...
        case_0n
      ] 
    },
    // ...
    { 
      relationship_m: { 
        id: 530,
        from_fieldset_key: 'field_set_name_0',
        to_fieldset_key: 'field_set_name_1',
        position: 1,
        to_organization_type_id: 161,
        from_work_type_id: 162,
        // ...
        from_key: 'field_name_0',
        to_key: 'field_name_1' 
     	 },
     	cases: [ 
        case_m0,
        // ...
        case_mn
      ] 
    },
  ]
  ```

  ​

Retrieves the cases that _belong to_ this one and are of the case type that corresponds to the value of `relatedCaseTypeCode` .  For example:

```{javascript}
Caseblocks.Case.get('584fd9201e7d66d2870d80ba')
	.then(result => {
      result.related('grandchild')
        .then(relationships => {
            console.log(relationships[0].cases[0].attributes.full_name)
        })
    })
  	.catch(err => {
      console.log(err.message)
    });
```



#### `teams()`

Retrieves the teams that are participants in this case

```javascript
Caseblocks.Case.get("support_requests", "550c40d1841976debf000003")
    .then(function(doc) {
      doc.teams().then(function(teams) {
        console.log(teams[0].display_name)
      })
    }).catch(function(err){
      console.log(err)
    });
```

#### `users()`

Retrieves the users that are listed as an individual user as a participant on this case

```javascript
Caseblocks.Case.get("support_requests", "550c40d1841976debf000003")
    .then(function(doc) {
      doc.users().then(function(users) {
        console.log(users[0].display_name)
      })
    }).catch(function(err){
      console.log(err)
    });
```

#### `participants()`

Retrieves all the users that are participants including team members.

```javascript
Caseblocks.Case.get("support_requests", "550c40d1841976debf000003")
    .then(function(doc) {
      doc.participants().then(function(users) {
        console.log(users[0].display_name)
      })
    }).catch(function(err){
      console.log(err)
    });
```


## Document

### Constructor

#### `new Caseblocks.Document(attributes, caseInstance)`

The constructor for document takes the attributes of the document and the case object it is contained within.

### Class Methods

#### `fromString(caseTypeId, caseInstance, fileName, contents)`

- arguments:
    - `{string|number} caseTypeId` The id of the case type this case belongs to
    - `{object} caseInstance ` The case to attach it to
    - `{string} fileName ` The name of the file
    - `{string} contents ` The content of the file
- returns: `{Promise.<Document>}` A promise that resolves to the metadata about the saved file.

This function creates a document from a string and attaches it to `caseInstance`.


```javascript
const caseTypeId = 1964
fileName = 'secret_message.txt'
fileContents = 'The bird is in the nest.'

Caseblocks.Case.get('secret_agents', '09eef94cbc39370046000da1')
    .then(caseInstance => 
        
          Caseblocks.Document.fromString(
            caseTypeId,
            caseInstance,
            fileName,
            fileContents
          ).then(document => {
          
            // Do something with the document
            
          }).catch(err => {
            
            // Handle error
            
          })
        
    ).catch(err => {
      
      // Handle error
      
    })
```

Once an invocation of this method has succeeded a new text file may be found in the documents section of the view of the specified case. Its name and contents 
will be `fileName` and `contents`. 

### Instance Methods

#### `rename(newFilename)`

Renames the document in the case and updates any related document fields

```javascript
Caseblocks.Case.get("support_requests", "case-with-documents")
    .then(function(caseInstance) {
      docs = caseInstance.documents()
      if (docs.length > 0) {
        docs[0].rename("new-filename.pdf").then(function(doc) {
          console.log(doc.file_name)
        }).catch(function(err){
          console.log(err)
        });
      }
    }).catch(function(err){
      console.error(err)
    });
```

### `delete()`

- returns: `{Promise.<boolean>}` A promise that resolves into `True` if and only if the document instance has been successfully deleted.
- throws: `{Error}` When the deletion was not successful. 

Deletes both de document instance and the file in the server it represents.

```javascript
Caseblocks.Case.get('classified_files', '09eef94cbc3k70046000da1')
    .then(classifiedFile => 
        classifiedFile.delete()    
    )
    .then(deleted => {
        if (deleted) {
            const msg = `Classified file "${classifiedFile}" has been deleted.`
            console.log(msg)
        }
    })
    .catch(err => {
      // Handle error
    })
```

### `copyToCase(caseInstance, options)`

- arguments:
    - `{Case} caseInstance` the case to which attach a copy of the file that the document instance represents.
    - `{object} options` a plain object whose attributes modify the operations of this function:
        - `{string} targetFilename` The name the file copied should have in the destination case folder. Its default value is the name of the source file (`this.file_name`). It should include the file name extension. 
        - `{boolean} overwriteOnFound` `true` if the file contents of a destination file with the same name are to be overwritten by the ones of the document being copied. Its default value is `false`. 
- returns: `{Promise.<Document>}` A promise that resolves into the instance of the new instance of `Document` attached to `caseInstance`, whose file contents are a copy of the ones found in `this`. The promise is rejected if an error occurred at any of the stages of the operation it implements or if `caseInstance.documents().some(d => d.file_name === options.targetFilename)` _and_ `options.overwriteOnFound === false`. 

Copies the `Document` instance that this method is called upon and attaches it to the target `Case` instance, copying as well the contents of the file this it represents. 

```javascript
Caseblocks.Case.get('capulet_members', '82aef94cbc3d70046000da1')
    .then(juliet => 
        Caseblocks.Case.get('montague_members', '09eef94cbc3k70046000da1')
            .then(romeo => {
                const document = juliet.documents().find(
                    document => document.file_name ==== 'desperate_love_letter.md'
                )
                return document.copyToCase(romeo, {
                    newFileName: 'letter_from_juliet.md'
                })
            })        
    )
    .then(newDocument => {
        // At this point newDocument belongs to romeo and represents a file attached
        // to this case with name 'letter_from_juliet.md' and the same contents
        // as the original 'desperate_love_letter.md' file that is still attached
        // to the juliet case.  
    })
    .catch(err => {
        // Handle error
    })
```           

## Tasklist

### Class Methods

#### `get(taskListId)`

Retrieve a tasklist matching the __id__ supplied.

```javascript
    Caseblocks.Tasklist.get("550c40d1841976debf00000a").then(function(tasklist) {
      console.log(tasklist.name)
    }).catch(function(err){
      console.error(err)
    })
```

#### `getAll(taskListIds)`

Retrieves multiple tasklists in one go.  Pass in an array of string id's and the matching Tasklists will be returned in an array.

```javascript
const ids = [
    "550c40d1841976debf00000a", 
    "550c40d1841976debf00000c", 
    "550c40d1841976debf00000e"
];

Caseblocks.Tasklist.getAll(ids).then(function(tasklists) {
  console.log(tasklists.length)
}).catch(function(err){
  console.error(err)
});
```

#### `tasks()`

Retrieves all tasks associated with this tasklist, returns a promise with an array of tasks.

```javascript
const ids = [
    "550c40d9841976debf000018", 
    "550c40d9841976debf00001a", 
    "550c40d9841976debf00001c"
];

Caseblocks.Tasklist.getAll(ids).then(function(tasklists) {
  var tasklists_returned = tasklists.length
  tasklists.forEach(function(tasklist) {
    tasklist.tasks().then(function(tasks) {
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
```

## Task

### Class Methods

#### `get(taskId)`

Retrieves a task matching the **id** supplied

```javascript
Caseblocks.Task.get("550c40d1841976debf000004").then(function(task) {
  task.description.should.equal("Create Pull Request")
  done();
}).catch(function(err){
  done(err);
})
```

#### `getAll(taskIds)`

Retrieves multiple tasks in one go.  Pass in an array of string id's and the matching Tasks will be returned in an array.

```javascript 
const ids = [
    "550c40d1841976debf000004",
    "550c40d1841976debf000005",
    "550c40d1841976debf000006",
    "550c40d1841976debf000007",
    "550c40d1841976debf000008",
    "550c40d1841976debf000009"
]   

Caseblocks.Task.getAll(ids).then(function(tasks) {
      tasks.length.should.equal(6)
      tasks[2].description.should.equal("Merge in Github")
      done();
    }).catch(function(err){
      done(err);
    });
```


## Team

### Public Methods

#### `get(teamId)`

Retrieves a team matching the __id__ supplied

```javascript
Caseblocks.Team.get(5).then(function(team) {
  console.log(team.display_name))
}).catch(function(err){
  console.err(err)
})
```

### Instance Methods

#### `members()`

Retrieves the users that are members in this team.

```javascript
Caseblocks.Team.get(5).then(function(team) {
  team.members().then(function(users) {
    users.map(function(user) {
      console.log(user.display_name)
    })
  })
}).catch(function(err){
  console.err(err)
})
```

## User

### Public Methods

#### `get(userId)`

Retrieves a user matching the __id__ supplied

```javascript
Caseblocks.User.get(5).then(function(user) {
  console.log(user.display_name))
}).catch(function(err){
  console.err(err)
})
```

#### `getAll()`

Retrieves the complete list of users for an account

```javascript
Caseblocks.User.getAll().then(function(users) {
  for (var i=0; i <= users.length; i++) {
    console.log(users[i].display_name))        
  }
}).catch(function(err){
  console.err(err)
})
```

## Buckets

### Class Methods

#### `get(bucketId, caseTypeCode)`

Retrieves a bucket from caseblocks supplying the id of the bucket and its case type code.

```javascript
Caseblocks.Bucket.get(6, "bulk_uplifts").then(function(bucket) {
    log(bucket.attributes.name)
}).catch(function(err) {
    log("Failed to get bucket")
    fail(JSON.stringify(err))
})
```

#### `stats()`

Saves any changes made to the current document.

```javascript
Caseblocks.Bucket.get(6, "bulk_uplifts").then(function(bucket) {
  log(bucket.attributes.name)
  bucket.stats().then(function(bucket_stats) {
    summary = bucket_stats["bucket_summary"]
    log("")
    log("Summary")
    log("=======")
    log("Total: " + summary.total)
    log("Last 24 hrs: " + summary.total_in_last_24_hours)
    log("")
    log("Stats")
    log("=====")
    stats = bucket_stats["bucket_stats"]
    for(i in stats) {
        log("  " + stats[i].term + ": " + stats[i].count)
    }
  }).catch(function(err) {
      log("Failed to get stats")
      fail(JSON.stringify(err))
  })
}).catch(function(err) {
    log("Failed to get bucket")
    fail(JSON.stringify(err))
})
```

#### `cases(page, pageSize)`

Retrieves cases contained in the bucket by page. Parameters are optional and `page` defaults to 0 and `pageSize` defaults to 10.

```javascript
Caseblocks.Bucket.get(6, "bulk_uplifts").then(function(bucket) {
  log(bucket.attributes.name)
  bucket.cases(0,10).then(function(cases) {
    log("Found " + cases.length + " cases.")

    for(kase of cases) {
        log(kase.attributes.title)
    }

    exit(payload)
  }).catch(function(err) {
      log("Failed to get cases")
      fail(JSON.stringify(err))
  })
}).catch(function(err) {
    log("Failed to get bucket")
    fail(JSON.stringify(err))
})
```

## Email

The email functions allow you to send an email either through mandrill or smtp.  You can also use the mandrill templating features.

Instantiate a new Caseblocks.Email object passing in your initial configuration, like keys and server details, then you can add recipients and setup your from address, subject, and body (html or text).

Mandrill is set as default and requires 'key' to be passed in when instantiating the object.

Other properties available are
* serverType - 'mandrillapp' or 'smtp' values are valid.
* smtpServer - required if serverType is smtp and is host of smtp server to use
    * key        - required if serverType is mandrill and is they access token key for your account


Example:

```javascript
let email = new Caseblocks.Email({"key": "sample-key"})
email.to("to-address@example.com")
email.to("second-to-address@example.com")
email.bcc("bcc-address@example.com")
email.from("from-address@example.com")
email.subject("This is a sample Subject")
email.body("<html><body style='text-align: center;'><h1>Hello World</h1></body></html>")

email.send().then(function(result) {
  exit(result);
})
```

The above example sets up the key for mandrill then adds a to address, bcc address, sets up the from address, subject and then adds an html body, then sends the email.

***Note***: Sending through SMTP is not implemented yet.

### Class Methods

#### `to(email, name)`

You can call to many times to add recipients to the email.  Name is an optional parameter.

#### `cc(email, name)`

You can call cc many times to add recipients to the email.  Name is an optional parameter.

#### `bcc(email, name)`

You can call bcc many times to add recipients to the email.  Name is an optional parameter.

#### `from(email, name)`

The from function, sets the from address of the email.  Again, name is optional.

#### `subject(text)`

Sets the subject for the email, text should be a string that will be used as the subject in the email.

#### `body(data)`

Sets the html body of the email, which will also automatically set the text using an html-to-text conversion tool.

#### `html(data)`

Alias of `body`

#### `text(data)`

Sets the text only version of the email.  This should be set after html as setting html overwrites this value.

#### `send()`

This function sends an email using either mandrill or smtp (to be implemented).  The above example shows how to setup an email before you call send.

#### `sendTemplate(template, data)`

Sends an email using a mandrill template.  The first parameter is a string that should match an existing mandrill template you wish to use.  The second parameter is a hash of data to be used with the template, eg

```json
{
  "title": "Have a merry Christmas",
  "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
}
```

This data will then be used with the fields in the mandrill template to render the email.

## Tests

### Writing

You will find the existing specs under the test folder.  HTTP calls are mocked in the *spec_helper.js* using *nock* file and you should add to this the calls and their results you expect to make.

### Running

```shell
npm test
```

Simples.

## Deploying to NPM

#### Setup NPM
  If this is the first time you are pushing to npm, you will need to setup your local npm first.

```shell
npm set init.author.name "Your Name"
npm set init.author.email "you@example.com"
npm set init.author.url "http://yourblog.com"
npm adduser
```

#### Publishing
  First task is to increment the version number in package.json.  Increment the last number for small changes... eg 0.1.17 becomes 0.1.18.

```json
"version": "0.1.18"
```

  Save the file publish using the following command.

```shell
npm publish
```

## Contributing

In lieu of a formal styleguide, just assume the basic good practice of taking care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.
