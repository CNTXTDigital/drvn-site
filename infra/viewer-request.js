// CloudFront Function (viewer-request, cloudfront-js-2.0).
// 1) Canonical host: drvnapp.com -> www.drvnapp.com
// 2) Permanent redirects for retired WordPress URLs
// 3) Trailing-slash normalisation, then map /path/ -> /path/index.html in S3
var REDIRECTS = {
  '/teendrivingroadmap/': '/guide/',
  '/state-guide/': '/guide/',
  '/guide/search/': '/guide/',
  '/sitemap.html': '/guide/',
  '/sitemap.xml': '/sitemap-index.xml',
  '/sitemap_index.xml': '/sitemap-index.xml',
  '/query.php': '/guide/',
  '/blog/page/1/': '/blog/',
  '/listing/': '/',
  '/gone/': '/',
  '/www.nhtsa.gov': 'https://www.nhtsa.gov/',
  '/feed/': '/blog/',
  '/comments/feed/': '/blog/',
  '/wp-login.php': '/',
  '/xmlrpc.php': '/',
  // WordPress-era posts retired October 2026 -> closest new article
  '/the-50-hour-rule-why-practice-time-matters-more-than-you-think/': '/50-hour-myth-driving-practice/',
  '/building-skills-in-stages-a-month-by-month-driving-plan-for-parents/': '/permit-year-practice-plan/',
  '/making-the-time-creative-ways-to-fit-driving-practice-into-busy-schedules/': '/permit-year-practice-plan/',
  '/5-tips-to-fit-in-driving-time-with-your-teen/': '/permit-year-practice-plan/',
  '/the-parent-coach-mindset-balancing-safety-patience-and-constructive-feedback/': '/driving-feedback-without-a-fight/',
  '/teachers-ed-101/': '/stop-coaching-teen-driver/',
  '/weathering-the-storm-practice-in-rain-snow-and-low-visibility-conditions/': '/weather-driving-practice/',
  '/the-transition-to-solo-driving-setting-boundaries-before-they-go-alone/': '/first-six-months-teen-driver/',
  '/when-youre-the-passenger-keeping-the-conversation-going-after-the-permit-period/': '/staying-involved-after-the-license/',
  '/common-teen-driving-pitfalls-how-parents-can-prevent-them/': '/teen-driving-safety/',
  '/defensive-driving-for-teens-teaching-awareness-over-aggression/': '/teen-driving-safety/',
  '/7-car-myths-youve-got-to-stop-teaching/': '/teen-driving-safety/',
  '/step-by-step-guide-to-buying-a-car/': '/choosing-a-car-for-a-teen-driver/',
  '/build-the-ultimate-car-emergency-kit/': '/teen-first-fender-bender/',
  '/technology-and-teens-using-drvn-apps-and-dash-cams-as-powerful-teaching-tools/': '/app/',
  '/the-drvn-roadmap/': '/app/',
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
