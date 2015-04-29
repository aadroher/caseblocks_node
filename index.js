

var Case = require('./case.js')


/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} html
 * @return {String}
 */
module.exports = {

  findCase: function(case_type_name, id) {
    console.log("testing");
    var kase = new Case()
    promise = kase.find(case_type_name, id);

    return promise;
  },

  escape: function(html) {
    return String(html)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  /**
   * Unescape special characters in the given string of html.
   *
   * @param  {String} html
   * @return {String}
   */
  unescape: function(html) {
    return String(html)
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, '\'')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }
};
