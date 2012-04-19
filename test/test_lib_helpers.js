var chai = require('chai');
var expect = chai.expect;
var request = require('request');
var moment = require('moment');
var Q = require('q');

var h = require('../lib/helpers.js');

describe('Helper functions', function() {
  describe('timeDelta function', function() {
    it('should take two JavaScript date objects and return a valid delta',
       function() {
         // FORMAT: YYYY,MM,DD,H,HH
         var date1 = moment('1 January 1970 00:00:00');
         var date2 = moment('1 January 1980 00:00:00');

         // should be 315532800000
         var delta = h.timeDelta(date2, date1);
         expect(delta).to.be.a('number');
         expect(delta).to.equal(315532800000);

         // should be 0
         date1 = moment('1 January 2012 00:00:00');
         date2 = moment('1 January 2012 00:00:00');
         delta = h.timeDelta(date2, date1);
         expect(delta).to.be.a('number');
         expect(delta).to.equal(0)

         // # of millis in a day
         date1 = moment('1 January 2012 00:00:00');
         date2 = moment('2 January 2012 00:00:00');
         delta = h.timeDelta(date2, date1);
         expect(delta).to.be.a('number');
         expect(delta).to.equal(60 * 60 * 24 * 1000)
    });
  });
});
