var helper = require("./spec_helper");
var should = require('chai').should();
var Caseblocks = require('../index');

describe('bucket', function() {

  beforeEach(function() {
    this.timeout(5000);
    Caseblocks.setup("http://test-caseblocks-location", "tnqhvzxYaRnVt7zRWYhr");
    helper.nockHttp();
  });

  it("should get a bucket", function(done) {
    Caseblocks.Bucket.get(6, "another_case_type").then(function(bucket) {
      bucket.attributes.name.should.equal("Test Bucket");
      done();
    }).catch(function(err){
      done(err);
    });
  });

  it("should retrieve bucket stats", function(done) {
    Caseblocks.Bucket.get(6, "another_case_type").then(function(bucket) {
      bucket.stats().then(function(bucket_stats) {
          var summary = bucket_stats.bucket_summary;
          var stats = bucket_stats.bucket_stats;
          summary.total.should.equal(56);
          stats[0].term.should.equal("Not Started");
          stats[0].count.should.equal(56);
          done();
      }).catch(function(err){
        done(err);
      });
    }).catch(function(err){
      done(err);
    });
  });

  it("should retrieve contents of bucket", function(done) {
    Caseblocks.Bucket.get(6, "another_case_type").then(function(bucket) {
      bucket.cases().then(function(cases) {
        cases.length.should.equal(1);
        cases[0].attributes.title.should.equal("Case Title");
        done();
      }).catch(function(err){
        done(err);
      });
    }).catch(function(err){
      done(err);
    });
  });
});
