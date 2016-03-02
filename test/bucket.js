var helper = require("./spec_helper")

var should = require('chai').should(),
    Caseblocks = require('../index')



describe('bucket', function() {

  beforeEach(function() {
    this.timeout(5000);
    Caseblocks.setup("http://test-caseblocks-location", "tnqhvzxYaRnVt7zRWYhr")

  });

  it("should get a bucket") function(done) {
    Caseblocks.Bucket.get(24).then(function(bucket) {
      bucket.title.should.equal("Test Bucket")
    })
  });
  it("should retrieve contents of bucket")
  it ("should export a bucket")
  it ("should run batch task over bucket")
  it ("should update a bucket")
  it ("should create a bucket")
  it ("should delete a bucket")
})
