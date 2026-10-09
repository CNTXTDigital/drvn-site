// CloudFront Function (viewer-request, cloudfront-js-2.0).
// 1) Canonical host: drvnapp.com -> www.drvnapp.com
// 2) Permanent redirects for retired WordPress URLs
// 3) Trailing-slash normalisation, then map /path/ -> /path/index.html in S3
var REDIRECTS = {
  '/teendrivingroadmap/': '/guide/',
  '/state-guide/': '/guide/',
  '/blog/page/1/': '/blog/',
  '/listing/': '/',
  '/gone/': '/',
  '/www.nhtsa.gov': 'https://www.nhtsa.gov/',
  '/feed/': '/blog/',
  '/comments/feed/': '/blog/',
  '/wp-login.php': '/',
  '/xmlrpc.php': '/',
};

function redirect(location) {
  return { statusCode: 301, statusDescription: 'Moved Permanently', headers: { location: { value: location }, 'cache-control': { value: 'max-age=86400' } } };
}

function handler(event) {
  var req = event.request;
  var host = req.headers.host ? req.headers.host.value : '';
  var uri = req.uri;
  var qs = req.querystring || {};

  if (host === 'drvnapp.com') {
    return redirect('https://www.drvnapp.com' + uri);
  }

  // WordPress ?p=123 style links and old search URLs
  if (qs.p || qs.s || qs.page_id) {
    return redirect('/');
  }

  var target = REDIRECTS[uri] || REDIRECTS[uri + '/'];
  if (target) return redirect(target);

  // Anything under /wp-content/, /wp-admin/, /wp-includes/ is gone
  if (uri.indexOf('/wp-') === 0 && uri.indexOf('/wp-content/uploads/') !== 0) {
    return redirect('/');
  }

  var last = uri.substring(uri.lastIndexOf('/') + 1);
  if (last.indexOf('.') === -1) {
    if (uri.charAt(uri.length - 1) !== '/') {
      return redirect(uri + '/');
    }
    req.uri = uri + 'index.html';
  }
  return req;
}
