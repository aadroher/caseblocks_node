const fetch = require('node-fetch')
const Headers = require('node-fetch').Headers
const Task = require('./task.js')


function requestOptions(options={}) {

  const defaultHeaders = new Headers({
    'Accept': 'application/json'
  })

  const defaultOptions = {
    headers: defaultHeaders
  }

  return Object.assign(defaultOptions, options)

}

let Tasklist = function(attributes) {
  for(let k in attributes) {
    if (k != "tasks") {
      this[k] = attributes[k]
    } else {
      this._tasks = attributes["tasks"]
    }
  }
}

Tasklist.get = function(id) {
  if (!Tasklist.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  const url = Tasklist.Caseblocks.buildUrl("/case_blocks/tasklists.json?ids%5B%5D="+ id)

  return fetch(url, requestOptions())
    .then(response => response.json())
    .then(responseBody => {

      const taskListAttributes = responseBody.tasklists.pop()

      return new Tasklist(taskListAttributes)

    })

}

Tasklist.getAll = function(tasklist_ids) {
  if (!Tasklist.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  const url = Tasklist.Caseblocks.buildUrl("/case_blocks/tasklists.json?" + tasklist_ids.map(id => "ids%5B%5D="+id).join("&"))

  return fetch(url, requestOptions())
    .then(response => response.json())
    .then(responseBody =>
      responseBody.tasklists.map(
        tasklistAttributes =>  new Tasklist(tasklistAttributes)
      )
    )
}

Tasklist.prototype.tasks = function() {
  if (!Tasklist.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  if (this._tasks !== undefined && this._tasks.length > 0) {

    const url = Tasklist.Caseblocks.buildUrl("/case_blocks/tasks.json?" + this._tasks.map(id => "ids%5B%5D="+id).join("&"))
    // let self = this

    return fetch(url, requestOptions())
      .then(response => response.json())
      .then(responseBody =>
        responseBody.tasks.map(
          taskAttributes =>  new Task(taskAttributes)
        )
      )

  } else {

    return Promise.resolve([])

  }
}

module.exports = Tasklist;
