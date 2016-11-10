
const rest = require('restler-q');
const inflection = require( 'inflection' );

class Document {

  constructor(attributes, caseInstance) {

    Object.keys(attributes).forEach(key => {
      this[key] = attributes[key];
    });

    this.caseInstance = caseInstance;
    this.id = attributes._id;
    this.base_url = this.url.split("/").slice(0,-1).join("/");

    this.debug = [];

  }

  rename(newFilename) {

    if(!Document.Caseblocks) {

      throw "Must call Caseblocks.setup";

    } else {

      const originalFilename = this.file_name;
      const originalURL = this.url;

      this.debug.push("starting rename");

      const url = this.url;
      const formData = {
        new_file_name: newFilename
      };

      const requestUrl = `${Document.Caseblocks.buildUrl(url)}&new_file_name=${newFilename}`;

      // TODO: Not sure what is the use of this attributes. Remove them, maybe?
      this.requestUrl = requestUrl;
      this.requestData = formData;

      return rest.put(requestUrl, { data: formData }).then(jsonResponse => {
                const response = JSON.parse(jsonResponse);
                this.file_name = response.file_name;
                this.url = response.url;

                // TODO: Check if this attribute should be removed, too.
                this.documentResponse = response;

                return this;
              }).fail(err => {
                console.log(err);
                throw new Error("Error renaming document");
              });

    }

  }

  delete() {

    if(!Document.Caseblocks) {

      throw "Must call Caseblocks.setup";

    } else {

      throw("Not implemented Yet");

    }
  }

}


module.exports = Document;
