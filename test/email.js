var helper = require("./helpers/spec_helper")

var should = require('chai').should(),
    Caseblocks = require('../index')

describe('email', function() {

  beforeEach(function() {
    Caseblocks.setup("http://test-caseblocks-location", "tnqhvzxYaRnVt7zRWYhr")
    email = new Caseblocks.Email({key: "valid-mandrill-key"})

    helper.nockHttp()

  });

  describe("configuring", function() {

    it("has sensible defaults for configuration", function(done) {
      email = new Caseblocks.Email({key: "valid-mandrill-key"})
      email.format.should.equal("html")
      email.serverType.should.equal("mandrillapp")
      done()
    })
    it("takes a configuration", function(done) {
      email = new Caseblocks.Email({key: 'valid-mandrill-key', format: "html"})
      email.format.should.equal("html")
      done()
    })
    it("cannot overwrite function names", function(done) {
      email = new Caseblocks.Email({to: "invalid-value", key: 'valid-mandrill-key'})
      email.to.should.not.equal("invalid-value")
      done();
    })
    it("can set format of email", function(done) {
      email = new Caseblocks.Email({key: 'valid-mandrill-key', format: "html"})
      email.format.should.equal("html")
      done()
    })
    it("can set server type to use", function(done) {
      email = new Caseblocks.Email({smtpServer: 'valid-smtp-host', serverType: "smtp"})
      email.serverType.should.equal("smtp")
      done()
    })
    describe("mandrillapp", function() {
      it("can use mandrillapp", function(done) {
        email = new Caseblocks.Email({key: 'valid-mandrill-key', serverType: "mandrillapp"})
        email.serverType.should.equal("mandrillapp")
        done()
      })
      it("requires a key", function(done) {
        var fn = function () { new Caseblocks.Email({serverType: "mandrillapp"}) }
        helper.expect(fn).to.throw("'key' is a required field for serverType mandrillapp")
        done();
      })
    })
    describe("smtp", function() {
      it("can use a configured smtp server", function(done) {
        email = new Caseblocks.Email({smtpServer: 'valid-smtp-host', serverType: "smtp"})
        email.serverType.should.equal("smtp")
        done()
      }) // nodemailer
    })

  })

  describe("adding addresses", function() {
    it("can add to address", function(done) {
      email.to("dummy-1@example.com")

      email.to_addresses.length.should.equal(1)
      email.to_addresses[0].email.should.equal("dummy-1@example.com")

      done();
    })
    it("can add to address with name", function(done) {
      email.to("dummy-1@example.com", "Test User")

      email.to_addresses.length.should.equal(1)
      email.to_addresses[0].email.should.equal("dummy-1@example.com")
      email.to_addresses[0].name.should.equal("Test User")
      done();
    })

    it("can add cc address", function(done) {
      email.cc("dummy-1@example.com")

      email.cc_addresses.length.should.equal(1)
      email.cc_addresses[0].email.should.equal("dummy-1@example.com")

      done();
    })
    it("can add cc address with name", function(done) {
      email.cc("dummy-1@example.com", "Test User")

      email.cc_addresses.length.should.equal(1)
      email.cc_addresses[0].email.should.equal("dummy-1@example.com")
      email.cc_addresses[0].name.should.equal("Test User")
      done();
    })

    it("can add bcc address", function(done) {
      email.bcc("dummy-1@example.com")

      email.bcc_addresses.length.should.equal(1)
      email.bcc_addresses[0].email.should.equal("dummy-1@example.com")

      done();
    })
    it("can add bcc address with name", function(done) {
      email.bcc("dummy-1@example.com", "Test User")

      email.bcc_addresses.length.should.equal(1)
      email.bcc_addresses[0].email.should.equal("dummy-1@example.com")
      email.bcc_addresses[0].name.should.equal("Test User")
      done();
    })



    it("can add multiple to addresses", function() {
      email.to("test-1@example.com")
      email.to("test-2@example.com", "Billy")

      email.to_addresses.length.should.equal(2)
      email.to_addresses[0].email.should.equal("test-1@example.com")
      email.to_addresses[1].email.should.equal("test-2@example.com")
      email.to_addresses[1].name.should.equal("Billy")
    })
    it("can add multiple cc addresses", function() {
      email.cc("test-1@example.com")
      email.cc("test-2@example.com", "Billy")

      email.cc_addresses.length.should.equal(2)
      email.cc_addresses[0].email.should.equal("test-1@example.com")
      email.cc_addresses[1].email.should.equal("test-2@example.com")
      email.cc_addresses[1].name.should.equal("Billy")

    })
    it("can add multiple bcc addresses", function() {
      email.bcc("test-1@example.com")
      email.bcc("test-2@example.com", "Billy")

      email.bcc_addresses.length.should.equal(2)
      email.bcc_addresses[0].email.should.equal("test-1@example.com")
      email.bcc_addresses[1].email.should.equal("test-2@example.com")
      email.bcc_addresses[1].name.should.equal("Billy")
    })

    it("can add different address types", function() {
      email.to("a-to-address@example.com")
      email.cc("a-cc-address@example.com", "Billy")
      email.bcc("a-bcc-address@example.com", "John")

      email.to_addresses[0].email.should.equal("a-to-address@example.com")
      email.cc_addresses[0].email.should.equal("a-cc-address@example.com")
      email.cc_addresses[0].name.should.equal("Billy")
      email.bcc_addresses[0].email.should.equal("a-bcc-address@example.com")
      email.bcc_addresses[0].name.should.equal("John")
    })

  })

  describe("constructing", function() {

    it("can store a subject", function(done) {
      email.subject("valid-subject-content")
      email.internal_subject.should.equal("valid-subject-content")
      done()
    })
    it("can store a text body", function(done) {
      email.text("A text content")
      email.internal_text.should.equal("A text content")
      done()
    })
    it("can store an html body", function(done) {
      email.html("<html><body><h1>Some Html Content</h1></body></html>")
      email.internal_html.should.equal("<html><body><h1>Some Html Content</h1></body></html>")
      done()
    })

    it("can auto set text from html", function(done) {
      email.html("<html><body><h1>Some Html Content</h1><p>this is a sample paragraph</body></html>")
      email.internal_html.should.equal("<html><body><h1>Some Html Content</h1><p>this is a sample paragraph</body></html>")
      email.internal_text.should.equal("SOME HTML CONTENT\nthis is a sample paragraph")
      done()
    })
  })


  describe("sending", function() {
    it("cannot send with no to addresses", function(done) {
      fn = function() { email.send() }
      helper.expect(fn).to.throw("A 'to' address is required")
      done();
    })

    describe("mandrillapp", function() {
      it("can send email with valid subject and body", function(done) {
        email = new Caseblocks.Email({key: "valid-mandrill-key"})
        email.to("stewart@theizone.co.uk")
        email.from("stewart@emergeadapt.com", "CaseBlocks")
        email.subject("Test Email")
        email.body("test content")

        email.send().should.eventually.equal("success-mandrill-response").and.notify(done)
      })
      it("handles errors correctly", function(done) {
        email = new Caseblocks.Email({key: "valid-mandrill-key"})
        email.to("stewart@theizone.co.uk")
        email.from("stewart@emergeadapt.com", "CaseBlocks")
        email.subject("Simulate Error")
        email.body("test content")

        email.send().should.be.rejectedWith("failure-mandrill-response").and.notify(done)

      })
      it("sends using a template", function(done) {
        email = new Caseblocks.Email({key: "valid-mandrill-key"})
        email.to("stewart@theizone.co.uk")
        email.from("stewart@emergeadapt.com")
        email.subject("Simulate Success")
        email.body("test content")

        email.sendTemplate("test-template", {title: "Test Name", productName: "product name in email"}).should.eventually.equal("success-mandrill-template-response").and.notify(done)
      })

    })

    describe("smtp", function() {
      it("cannot send without a server")
      it("handles connection errors to server")
      it("handles smtp errors from server")
      it("can send email with valid subject and body")
      it("can send text email")
      it("can send html email")
    })

  })




})
