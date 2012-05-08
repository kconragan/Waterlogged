var chai = require('chai');
var expect = chai.expect;
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
         expect(delta).to.equal(0);

         // # of millis in a day
         date1 = moment('1 January 2012 00:00:00');
         date2 = moment('2 January 2012 00:00:00');
         delta = h.timeDelta(date2, date1);
         expect(delta).to.be.a('number');
         expect(delta).to.equal(60 * 60 * 24 * 1000);
    });
  });
  describe('getBuoyData function', function() {
    it('given a buoy and time, it should return correct NOAA url', function() {
        var fiveDay = moment().subtract('days', 3);
        var url = h.getBuoyData('46237', fiveDay);
        expect(url).to.equal('http://www.ndbc.noaa.gov/data/5day2/46237_5day.txt');

        var fourtyFiveDay = moment().subtract('days', 7);
        var url2 = h.getBuoyData('46237', fourtyFiveDay);
        expect(url2).to.equal('http://www.ndbc.noaa.gov/data/realtime2/46237.txt');

        var yearly = moment('1 January 2010 00:00:00');
        var url3 = h.getBuoyData('46237', yearly);
        var yearUrl = 'http://www.ndbc.noaa.gov/view_text_file.php?' +
                      'filename=46237h2010.txt.gz&dir=data/historical/stdmet/';
        expect(url3).to.equal(yearUrl);
    });
  });
  describe('parseBuoyData function', function() {
    it('compare timestamp to array of buoy readings to find closest',
      function() {
        var epicSurfDate = moment('22 January 2011 13:30:00'); // PST
        var fDate = moment(Date.UTC.apply({}, ['2011', '01', '22', '04', '05']));
        var fDate2 = moment(Date.UTC.apply({}, ['2011', '01', '23', '04', '05']));
        var fDate3 = moment(Date.UTC.apply({}, ['2011', '01', '24', '04', '05']));
        var fakeReadings = [
          {
            timestamp: fDate,
            wvht: 4.10
          },
          {
            timestamp: fDate2,
            wvht: 1.10
          },
          {
            timestamp: fDate2,
            wvht: 0.45
          }
        ];

        var r = h.compareBuoyReadings(epicSurfDate, fakeReadings);
        expect(r.wvht).to.equal(4.10);

    });
  });
});