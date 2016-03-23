var assert = require('assert');
var YelpScraper = require('../lib/scrapers/yelp')

describe('YelpScraper', function() {
  var scraper;

  before(function(done) {
    scraper = new YelpScraper();
    done();
  });

  describe('#findBestMatch()', function () {
    describe('should return not found', function () {

      it('wrong name', function (done) {
        var biz = {name: 'Geico', address: '6410 Frederick Rd', zip: '21228', phone: '4439487107'};
        var parsedBusinesses = [
          { name: 'Geico Insurance Agent',
            phone: '4108828200',
            address: '7915 Belair RdBaltimore' },
          { name: 'Matt Hauser - GEICO',
            phone: '4109950040',
            address: '2620 Annapolis RdSevern' },
          { name: 'Geico',
            phone: '3019863880',
            address: '5260 Western AveChevy Chase' },
          { name: 'Geico',
            phone: '8008618380',
            address: 'One Geico PlzWashington' },
          { name: 'GEICO Insurance Agent',
            phone: '4105717722',
            address: '2563 Forest Dr Fl 1Annapolis' },
          { name: 'Premier Insurance Agency',
            phone: '4107479111',
            address: '6410 Frederick RdCatonsville' },
          { name: 'JGS Advisors Insurance Group',
            phone: '9723778900',
            address: '7410 Preston RdFrisco' },
          { name: 'Feehely Insurance, Inc.-Nationwide Insurance',
            phone: '4107440300',
            address: '300 Frederick RdCatonsville' },
          { name: 'Al Laws Insurance Service',
            phone: '4436129010',
            address: '150 Nunnery LnCatonsville' },
          { name: 'Paul Funk - State Farm Insurance Agent',
            phone: '4107440077',
            address: '307 Frederick RdBaltimore' }
        ];
        assert.deepEqual({business: null, status: 'not found'}, scraper.findBestMatch(biz, parsedBusinesses));
        done();
      });

      it('wrong address', function (done) {
        var biz = { name: 'Geico',
          address: '8305 SE Monterey Ave',
          zip: '97086',
          phone: '9717036017'}
        var parsedBusinesses = [
         { name: 'Geico Insurance Agent',
           phone: '5037940901',
           address: '13035 SE 84th Ave' }
        ];
        assert.deepEqual({business: null, status: 'not found'}, scraper.findBestMatch(biz, parsedBusinesses));
        done();
      });

      it('wrong distance', function (done) {
        var biz = { name: 'Time Warner Cable',
          address: '2415 N Las Vegas Blvd',
          zip: '15025',
          phone: '4123469423',
          status: '' }
        var parsedBusinesses = [
         { name: 'Time Warner Cable & Security',
           phone: '7247451550',
           address: 'Ridge Avenue Ext',
           distance: 0 }
        ];
        assert.deepEqual({business: null, status: 'not found'}, scraper.findBestMatch(biz, parsedBusinesses));
        done();
      });

      it('wrong address 2', function (done) {
        var biz = { name: 'Nationwide Insurance',
          address: '65 Germantown 406',
          zip: '38018',
          phone: '9014437689',
          status: '' };
        var parsedBusinesses = [
         { name: 'Nationwide Insurance',
           phone: '9015079977',
           address: '680 N Germantown Pkwy',
           distance: 0 }];
        assert.deepEqual({business: null, status: 'not found'}, scraper.findBestMatch(biz, parsedBusinesses));
        done();
      });

      it('wrong address 3', function (done) {
        var biz = { name: 'Nationwide Insurance',
          address: '9332 Elk Grove Blvd 110',
          zip: '95624',
          phone: '9162469678',
          status: '' };
        var parsedBusinesses = [
         { name: 'Knowles Nationwide Insurance Agency',
           phone: '9167533242',
           address: '8788 Elk Grove Blvd',
           distance: 0.01 } ];
        assert.deepEqual({business: null, status: 'not found'}, scraper.findBestMatch(biz, parsedBusinesses));
        done();
      });
    });

    describe('should return reverted', function () {
      it('case #1', function (done) {
        var biz = { 
          name: 'Alternative Paths Counseling',
          address: '300 Church Street',
          zip: '6492',
          phone: '2034634628' }
        var parsedBusinesses = [{ name: 'Alternative Paths',
          phone: '2032657770',
          address: '300 Church St Rte 68' }
        ];
        assert.deepEqual({business: parsedBusinesses[0], status: 'reverted'}, scraper.findBestMatch(biz, parsedBusinesses));
        done();
      });

      it('case #2', function (done) {
        var biz = {
          name: 'Fleischman & Fleischman, PA',
          phone: '5616094996',
          address: '800 E. Broward Blvd.',
          zip: '33301'}
        var parsedBusinesses = [{
          name: 'Fleischman & Fleischman PA',
          phone: '9545237223',
          address: '800 E Broward Blvd',
          distance: 0.01 }
        ];
        assert.deepEqual({business: parsedBusinesses[0], status: 'reverted'}, scraper.findBestMatch(biz, parsedBusinesses));
        done();
      });

      it('case #3', function (done) {
        var biz = { 
          name: 'Aluminum Superior Installations Inc.',
          address: '3005 Forsyth Road',
          zip: '32792',
          phone: '4073777759',
          status: '' }
        var parsedBusinesses = [{ name: 'Superior Aluminum Installations Inc',
          phone: '4076780500',
          address: '3005 Forsyth Rd',
          distance: 0.01 }
        ];
        assert.deepEqual({business: parsedBusinesses[0], status: 'reverted'}, scraper.findBestMatch(biz, parsedBusinesses));
        done();
      });
    });

  });

});
