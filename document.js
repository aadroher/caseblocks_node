
const https = require('https');
const url = require('url');
const rest = require('restler-q');

// Utility functions and constants not to be exposed.
// This is a poor mans (and more functional) way of defining private
// members (is's a closure, after all).

const randomStringLength = 15;
const CRLF = '\r\n';

const getDocumentsEndPointPath = (caseTypeId, caseInstance) => {
  const accountId = caseInstance.account_id;
  const caseId = caseInstance._id;
  return `/documents/${accountId}/${caseTypeId}/${caseId}/`;
};

const getBoundary = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const randomString = [...Array(randomStringLength).keys()].reduce((acc, position) =>
    acc + chars.charAt(Math.floor(Math.random() * chars.length))
  );
  return `${randomString}`;
};

class Document {

  // Static methods

  /**
   * Creates a document from a string and attaches it to caseInstance
   * @param caseTypeId {string} The id of the case type this case belongs to
   * @param caseInstance {object} The case to attach it to
   * @param fileName {string} The name of the file
   * @param contents {string} The content of the file
   * @return {Promise.<Document>} A promise that resolves to the metadata about the saved file.
   */
  static fromString(caseTypeId, caseInstance, fileName, contents) {

    // TODO: Implement this guard as a method decorator.
    if(!Document.Caseblocks) {

      const msg = 'You must first call Caseblocks.setup';
      throw new Error(msg);

    } else {

      const documentsEndPointPath = getDocumentsEndPointPath(caseTypeId, caseInstance);
      const uri = Document.Caseblocks.buildUrl(documentsEndPointPath);

      const urlObject = url.parse(uri, true);
      const boundary = getBoundary();

      const payloadLines = [
        `--${boundary}`,
        `Content-Disposition: form-data; name="newFileName"`,
        '',
        `${fileName}`,
        `--${boundary}`,
        `Content-Disposition: form-data; name="file"; filename="${fileName}"`,
        `Content-Type: text/plain; charset=utf-8`,
        '',
        `${contents}`,
        `--${boundary}--`
      ];


      const payload = payloadLines.join(CRLF);
      const payloadBuffer = Buffer.from(payload);

      const requestOptions = {
        protocol: urlObject.protocol,
        hostname: urlObject.hostname,
        path: urlObject.path,
        method: 'POST',
        headers: {
          'Content-Length': payloadBuffer.length,
          'Content-Type': `multipart/form-data; boundary="${boundary}"`,
          'Accept': '*/*',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.8',
          'auth_token': Document.Caseblocks.token
        },
      };

      // Here the actual action begins.
      return new Promise((resolve, reject) => {

        let req = https.request(requestOptions, res => {

          const statusCode = res.statusCode;

          // Accumulate the response on an external variable.

          let respString = '';

          res.setEncoding('utf-8');

          res.on('data', chunk => {
            respString += chunk + '\n';
          });

          res.on('end', () => {

            if (![200, 201].includes(statusCode)) {

              const msg = `The document server has returned error ${statusCode}:\n` +
                          `${respString}`;
              reject(new Error(msg));

            } else {

              const respBodyObject = JSON.parse(respString);
              const document = new Document(respBodyObject, caseInstance);
              resolve(document);

            }
          });

        });

        // Bind the error to reject.
        req.on('error', err => {
          reject(new Error(err.message));
        });

        // Write the payload.
        req.write(payloadBuffer);

        // Mark the request as complete.
        req.end();

      });

    }

  }

  // Instance methods
  constructor(attributes, caseInstance) {

    Object.keys(attributes).forEach(key => {
      this[key] = attributes[key];
    });

    this.caseInstance = caseInstance;
    this.id = attributes._id;

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

      return rest.put(requestUrl, { data: formData }).then(jsonResponse => {

                const response = JSON.parse(jsonResponse);

                return {
                  file_name: response.file_name,
                  url: response.url
                }

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
