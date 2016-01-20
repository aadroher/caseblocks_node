var rest = require('restler-q');
var inflection = require( 'inflection' );

var Q = require('q');

var Conversation = function(attributes) {
  this.attributes = {};
  for(var k in attributes) {
    this.attributes[k] = attributes[k];
  }
  this.id = this.attributes._id;
};
