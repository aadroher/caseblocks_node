const fetch = require('node-fetch')
const Headers = require('node-fetch').Headers


function requestOptions(options={}) {

  const defaultHeaders = new Headers({
    'Accept': 'application/json'
  })

  const defaultOptions = {
    headers: defaultHeaders
  }

  return Object.assign(defaultOptions, options)

}

let Task = function(attributes) {

  for(let k in attributes) {
    this[k] = attributes[k]
  }
  this.id = attributes["_id"]
}


Task.get = function(id) {
  if (!Task.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  const url = Task.Caseblocks.buildUrl("/case_blocks/tasks.json?ids%5B%5D="+id)

  return fetch(url, requestOptions())
    .then(response => response.json())
    .then(responseBody => {

      const taskAttributes = responseBody.tasks.pop()
      return new Task(taskAttributes)

    })

}

Task.getAll = function(ids) {
  if (!Task.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  const url = Task.Caseblocks.buildUrl("/case_blocks/tasks.json?" + ids.map(function(id) {return "ids%5B%5D="+id}).join("&"))

  return fetch(url, requestOptions())
    .then(response => response.json())
    .then(responseBody =>
      responseBody.tasks.map(
        taskAttributes => new Task(taskAttributes)
      )
    )
}

Task.prototype.execute = function() {
  if (!Task.Caseblocks)
    throw new Error("Must call Caseblocks.setup");

  const url = Task.Caseblocks.buildUrl("/case_blocks/tasks/" + this.id + ".json")

  let self = this
  self.status = "in_progress"

  const payload = {
    task: self
  }

  const optionsExtension = {
    method: 'put',
    body: JSON.stringify(payload)
  }

  return fetch(url, requestOptions(optionsExtension))
    .then(_ => self)

}

module.exports = Task;
