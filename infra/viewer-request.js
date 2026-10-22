// CloudFront Function (viewer-request, cloudfront-js-2.0).
// 1) Canonical host: drvnapp.com -> www.drvnapp.com
// 2) Permanent redirects for retired WordPress URLs
// 3) Trailing-slash normalisation, then map /path/ -> /path/index.html in S3
// Retired school listings (/listing/{id}/...) 301 to their city guide, looked up in the
// CloudFront KeyValueStore "drvnapp-listing-redirects" (data: src/data/guide/listing-redirects.json).
import cf from 'cloudfront';
var LISTINGS = cf.kvs('79481b66-add2-4e83-af3d-999bc6f7b051');
// Two-letter state code -> state guide slug.
var STATES = {al:'alabama',ak:'alaska',az:'arizona',ar:'arkansas',ca:'california',co:'colorado',ct:'connecticut',de:'delaware',fl:'florida',ga:'georgia',hi:'hawaii',id:'idaho',il:'illinois',in:'indiana',ia:'iowa',ks:'kansas',ky:'kentucky',la:'louisiana',me:'maine',md:'maryland',ma:'massachusetts',mi:'michigan',mn:'minnesota',ms:'mississippi',mo:'missouri',mt:'montana',ne:'nebraska',nv:'nevada',nh:'new-hampshire',nj:'new-jersey',nm:'new-mexico',ny:'new-york',nc:'north-carolina',nd:'north-dakota',oh:'ohio',ok:'oklahoma',or:'oregon',pa:'pennsylvania',ri:'rhode-island',sc:'south-carolina',sd:'south-dakota',tn:'tennessee',tx:'texas',ut:'utah',vt:'vermont',va:'virginia',wa:'washington',wv:'west-virginia',wi:'wisconsin',wy:'wyoming'};
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

function gone() {
  return {
    statusCode: 410,
    statusDescription: 'Gone',
    headers: {
      'content-type': { value: 'text/html; charset=utf-8' },
      'cache-control': { value: 'max-age=86400' },
      'x-robots-tag': { value: 'noindex' },
    },
    body: { encoding: 'text', data: '<!doctype html><title>Gone | DRVN</title><meta name="robots" content="noindex"><p>This page no longer exists. <a href="https://www.drvnapp.com/">Go to DRVN</a>.</p>' },
  };
}

async function handler(event) {
  var req = event.request;
  var host = req.headers.host ? req.headers.host.value : '';
  var uri = req.uri;
  var qs = req.querystring || {};

  // Spam pages injected into the old WordPress site (e.g. /402361-personal-dating-agency/).
  // Google still has hundreds indexed; 410 Gone tells it to drop them faster than a 404.
  // Real URLs never start with 4+ digits (legit ones like /50-hour-myth.../ use 1-2).
  if (/^\/[0-9]{4,}-[^\/]*\/?$/.test(uri)) {
    return gone();
  }

  // Retired driving-school listing pages -> the city (or state) guide that replaced them.
  var lm = uri.match(/^\/listing\/([0-9]+)(\/|$)/);
  if (lm) {
    var dest = '/guide/';
    try { dest = await LISTINGS.get(lm[1]); } catch (e) {}
    return redirect('https://www.drvnapp.com' + dest);
  }

  // Junk URLs from the old site, where school websites were linked without "https://"
  // (e.g. /guide/dwight-il/wwsd209.org/). Send them to their state's guide.
  // Not every old city still has a guide, so these go to the state guide (always present).
  var gm = uri.match(/^\/guide\/([a-z0-9-]+)\/.+/);
  if (gm) {
    var sc = gm[1].match(/-([a-z]{2})$/);
    var stSlug = sc ? STATES[sc[1]] : null;
    var isState = false;
    for (var k in STATES) { if (STATES[k] === gm[1]) { isState = true; break; } }
    return redirect('https://www.drvnapp.com/guide/' + (stSlug || (isState ? gm[1] : '')) + (stSlug || isState ? '/' : ''));
  }

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
