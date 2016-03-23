var cheerio = require('cheerio');
var sugar = require('sugar');
var request = require('sync-request');

function YelpScraperBase() {
  var self = this;
  self.busy = false;
  request('POST', [SETTINGS.broker, 'endrequest/yelp_scraper', SETTINGS.host, SETTINGS.port].join('/'));

  self.isBusy = function() {
    return self.busy;
  };

  self.start = function() {
    self.busy = true;
    request('POST', [SETTINGS.broker, 'startrequest/yelp_scraper', SETTINGS.host, SETTINGS.port].join('/'));
  };

  self.end = function() {
    self.busy = false;
    request('POST', [SETTINGS.broker, 'endrequest/yelp_scraper', SETTINGS.host, SETTINGS.port].join('/'));
  };

  self.findBestMatch = function(biz, businesses) {

    if (businesses.length == 0) {
      return {business: null, status: 'not found'};
    }

    var business = businesses[0];
    var status = 'not found';
    var isReverted = false;
    var revertedBusiness = null;
    for (var i = 0; i < businesses.length; i++) {
      if (businesses[i].address.length == 0) {
        continue;
      }
      address1 = businesses[i].address.replace(/[^a-zA-Z0-9 ]/g, "");
      address2 = biz.address.replace(/[^a-zA-Z0-9 ]/g, "");
      if (YelpScraperBase.nameIsMatched(biz.name, businesses[i].name) && YelpScraperBase.similarAdress(address1, address2)) {
        isReverted = true;
        revertedBusiness = businesses[i];
        break;
      }

    }
    if ( status == 'not found' ) {
      for (var i = 0; i < businesses.length; i++) {

        address1 = businesses[i].address.replace(/[^a-zA-Z0-9 ]/g, "");
        address2 = biz.address.replace(/[^a-zA-Z0-9 ]/g, "");

        if (businesses[i].address.length == 0 && YelpScraperBase.nameIsMatched(biz.name, businesses[i].name) && businesses[i].distance < 0.1) {
          isReverted = true;
          revertedBusiness = businesses[i];
          break;
        }

      }
    }

    if (status == 'not found') {
      business = null
      if (isReverted) {
        status = 'reverted';
        business = revertedBusiness;
      }
    }

    return {business: business, status: status};
  };
};

YelpScraperBase.getTextFromElement = function($, selector) {
  $(selector).children().replaceWith(' ');
  return $(selector).text().trim();
};

YelpScraperBase.preparePhone = function(str) {
  return str.replace(/[^0-9]/g, '');
};

YelpScraperBase.nameIsMatched = function(name1, name2) {
  sortedName1 = name1.split(' ').sortBy().join(' ').replace(/[^a-zA-Z0-9 ]/g, "");
  sortedName2 = name2.split(' ').sortBy().join(' ').replace(/[^a-zA-Z0-9 ]/g, "");

  if (name1.toLowerCase().indexOf(name2.toLowerCase()) > -1 || name2.toLowerCase().indexOf(name1.toLowerCase()) > -1) {
    return true;
  }

  if (sortedName1.toLowerCase().indexOf(sortedName2.toLowerCase()) > -1 || sortedName2.toLowerCase().indexOf(sortedName1.toLowerCase()) > -1) {
    return true;
  }

  return (YelpScraperBase.similarText(name1, name2, true)) > 80 || (YelpScraperBase.similarText(sortedName1, sortedName2, true)) > 80;
};

YelpScraperBase.similarAdress = function(address1, address2) {
  var parts1 = address1.split(' ');
  var parts2 = address2.split(' ');

  if (!isNaN(parts1[0]*1) && !isNaN(parts2[0]*1) && parts1[0] != parts2[0]) {
    return false;
  }

  return YelpScraperBase.similarText(address1, address2, true) > 60;
};

YelpScraperBase.similarText = function(first, second, percent) {

  if (first === null || second === null || typeof first === 'undefined' || typeof second === 'undefined') {
    return 0;
  }

  first += '';
  second += '';

  var pos1 = 0,
    pos2 = 0,
    max = 0,
    firstLength = first.length,
    secondLength = second.length,
    p, q, l, sum;

  max = 0;

  for (p = 0; p < firstLength; p++) {
    for (q = 0; q < secondLength; q++) {
      for (l = 0;
        (p + l < firstLength) && (q + l < secondLength) && (first.charAt(p + l) === second.charAt(q + l)); l++)
      ;
      if (l > max) {
        max = l;
        pos1 = p;
        pos2 = q;
      }
    }
  }

  sum = max;

  if (sum) {
    if (pos1 && pos2) {
      sum += YelpScraperBase.similarText(first.substr(0, pos1), second.substr(0, pos2));
    }

    if ((pos1 + max < firstLength) && (pos2 + max < secondLength)) {
      sum += YelpScraperBase.similarText(first.substr(pos1 + max, firstLength - pos1 - max), second.substr(pos2 + max,
        secondLength - pos2 - max));
    }
  }

  if (!percent) {
    return sum;
  } else {
    return (sum * 200) / (firstLength + secondLength);
  }
};


YelpScraperBase.getMinOfArray = function(numArray) {
  return Math.min.apply(null, numArray);
};


module.exports = YelpScraperBase
