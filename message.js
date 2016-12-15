let Message = function(attributes) {
  this.attributes = {};
  for(let k in attributes) {
    this.attributes[k] = attributes[k];
  }
  this.id = this.attributes._id;
};
