'use strict';

var debug = require('debug')('cnpmjs.org:controllers:web:package:list');
var moment = require('moment');
var packageService = require('../../../services/package');

module.exports = function* search() {
  var params = this.query || {};
  var q = params.q || '';
  var page = parseInt(params.page) || 1;
  var pageSize = parseInt(params.pageSize) || 30;

  debug('search %j on page %j with pageSize %j', q, page, pageSize);
  var result = yield packageService.listPackages(q, (page - 1) * pageSize, pageSize);

  var match = null;
  for (var i = 0; i < result.searchMatchs.length; i++) {
    var p = result.searchMatchs[i];

    p.fromNow = moment(p.publish_time).fromNow();
    p.publishTime = moment(p.publish_time).format('YYYY-MM-DD hh:mm:ss');
    if (p.name === q) {
      match = p;
      break;
    }
  }

  var data = {
    keyword: q,
    match: match,
    packages: result.searchMatchs,
    pager: {
      page: page,
      pageSize: pageSize,
      total: result.total,
      totalPage: Math.ceil(result.total / pageSize)
    }
  };

  // return a json result
  if (params.type === 'json') {
    this.jsonp = data;
    return;
  }
  data.title = 'npm search - ' + q;
  yield this.render('list', data);
};
