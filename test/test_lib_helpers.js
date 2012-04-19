var chai = require('chai');
var expect = chai.expect;
var request = require('request');
var moment = require('moment');
var Q = require('q');

var h = require('../lib/helpers.js');

describe('Helper functions', function() {

  describe('compareTimeDelta function', function() {
    it('should take two JavaScript date objects and return the delta', function() {
      // FORMAT: YYYY,MM,DD,H,HH
      var date1 = moment('1 January 1970 00:00:00');
      var date2 = moment('1 January 1980 00:00:00');

      var delta = h.compareTimeDelta(date1, date2); // should be -315532800000 
      expect(delta).to.be.a('number');
      expect(delta).to.equal(-315532800000);

    });
  });
});
