/* ============================================================
  JAZ DESIGN — Bird banner announcement
  Squarespace: Settings > Advanced > Code Injection > FOOTER
  uses script tag to inject this entire block.

  HOW TO USE
  1. Pick which promo is live by setting _promoactive to its key
     (e.g. "kitchenguide"). Set _promoactive = "" to run nothing.
  2. Edit that promo's text/links in the _promos object below.
  3. Bump the promo's id when you want it to re-show once per tab
     session again.

  Behavior: on allowed pages the bottom bar is always shown, and
  where the browser allows it the flying-bird animation runs too.
  Both share one per-tab-session showing rule (reload or new window
  shows them again; in-site navigation does not).
============================================================= */

(function () {
  /* ================= EDIT ME ================= */

  /* Which promo is live. "" = nothing runs at all. */
  var _promoactive = "kitchenguide";

  /* Pages where the promo MAY show (substring match anywhere in URL). Empty = nowhere. */
  var _allowdisplay = ["", "/about", "/services"];

  /* All promos. Set _promoactive above to one of these keys. */
  var _promos = {
    kitchenguide: {
      id: "2026-08-kitchenguide",
      title: "FREE Kitchen Guide",
      copy: "Plan, budget and design your new kitchen with this FREE guide. More services available to help you create a perfect space.",
      linktext: "Check it out!",
      linkurl: "/kitchen-guide",
    },
    bathroomguide: {
      id: "2026-08-bathroomguide",
      title: "FREE Bathroom Guide",
      copy: "Plan, budget and design your new bathroom with this FREE guide. More services available to help you create a perfect space.",
      linktext: "Check it out!",
      linkurl: "/bathroom-guide",
    },
    artconvobook: {
      id: "2026-08-artconvobook",
      title: "Art Conversations",
      copy: "A new book exploring the conversations behind the art. Reserve your copy today.",
      linktext: "Check it out!",
      linkurl: "/art-conversations",
    },
  };
  /* =========================================== */

  /* ---- resolve active promo (or bail) ---- */
  if (!_promoactive) return;
  var P = _promos[_promoactive];
  if (!P) return;
  var _promoid = P.id;
  var _promotitle = P.title;
  var _promocopy = P.copy;
  var _promolinktext = P.linktext;
  var _promolinkurl = P.linkurl;

  /* ---- allowed pages only; "" = homepage (root path) exactly, others = substring match ---- */
  var _path = location.pathname.toLowerCase();
  var _url = (_path + location.search).toLowerCase();
  var _ok = false;
  for (var i = 0; i < _allowdisplay.length; i++) {
    var _a = _allowdisplay[i].toLowerCase();
    if (_a === "") {
      if (_path === "/" || _path === "") {
        _ok = true;
        break;
      } /* homepage only */
    } else if (_url.indexOf(_a) !== -1) {
      _ok = true;
      break;
    }
  }
  if (!_ok) return;

  /* ---- session flags (separate for bar-kill vs animation-shown) ---- */
  var KILL = "jazpromo:killed:" + _promoid;
  var ANIM = "jazpromo:animshown:" + _promoid;
  var nav = (performance.getEntriesByType && performance.getEntriesByType("navigation")[0]) || {};
  var isReload = nav.type === "reload";
  /* reload / new tab = fresh session: clear both flags */
  try {
    if (isReload) {
      sessionStorage.removeItem(KILL);
      sessionStorage.removeItem(ANIM);
    }
  } catch (e) {}
  function flagGet(k) {
    try {
      return sessionStorage.getItem(k);
    } catch (e) {
      return null;
    }
  }
  function flagSet(k) {
    try {
      sessionStorage.setItem(k, "1");
    } catch (e) {}
  }
  /* bar dismissed earlier this session = show nothing at all */
  if (flagGet(KILL)) return;

  var inIframe = (function () {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  })();
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  var css = [
    "#jzPromo{position:fixed;inset:0;z-index:99999;background:rgba(43,58,64,0);transition:background .5s ease;overflow:hidden;}",
    "#jzPromo.dim{background:rgba(43,58,64,.35);}",
    ".jzp-flyer{position:absolute;top:30%;left:0;transform:translateX(-130%);}",
    ".jzp-flyer.in{animation:jzpIn 2.6s cubic-bezier(.22,.7,.35,1) forwards;}",
    "@keyframes jzpIn{0%{transform:translateX(-130%) translateY(30px)}60%{transform:translateX(var(--jzc)) translateY(-10px)}100%{transform:translateX(var(--jzc)) translateY(0)}}",
    ".jzp-flyer.hov{animation:jzpBob 2.4s ease-in-out infinite;}",
    "@keyframes jzpBob{0%,100%{transform:translateX(var(--jzc)) translateY(0)}50%{transform:translateX(var(--jzc)) translateY(-10px)}}",
    ".jzp-flyer.stillbob{animation-play-state:paused;}",
    ".jzp-flyer.outfly{animation:jzpOut 1s cubic-bezier(.55,0,.85,.4) forwards;}",
    "@keyframes jzpOut{0%{transform:translateX(var(--jzc)) translateY(0)}100%{transform:translateX(120vw) translateY(-90px)}}",
    ".jzp-rig{display:flex;align-items:center;}",
    ".jzp-bird{width:200px;height:auto;flex:0 0 auto;overflow:visible;animation:jzpLift .62s ease-in-out infinite;filter:drop-shadow(0 6px 14px rgba(0,0,0,.15));}",
    "@keyframes jzpLift{0%,100%{transform:translateY(0)}42%{transform:translateY(5px)}}",
    ".jzp-tow{flex:0 0 auto;width:56px;height:14px;margin:0 -4px 0 2px;overflow:visible;}",
    ".jzp-tow path{stroke:#128BA5;stroke-width:2;fill:none;}",
    ".jzp-ban{position:relative;background:#fff;border:2px solid #A9C5A0;border-radius:8px;padding:18px 26px;max-width:min(60vw,420px);min-height:110px;display:flex;flex-direction:column;justify-content:center;box-shadow:0 10px 24px rgba(0,0,0,.16);transform-origin:right center;animation:jzpFlut 2.6s ease-in-out infinite;}",
    "@keyframes jzpFlut{0%,100%{transform:rotate(.7deg) skewY(.5deg)}50%{transform:rotate(-.8deg) skewY(-.6deg)}}",
    ".jzp-ban.calm{animation:none;transition:transform .5s ease-out;transform:none;}",
    ".jzp-ban{cursor:pointer;}",
    '.jzp-ban h3{margin:0 0 6px;font-family:"Playfair Display",inherit;font-size:clamp(16px,2.2vw,21px);color:#128BA5;font-weight:600;letter-spacing:.02em;}',
    '.jzp-ban p{margin:0;font-family:"Cabin",inherit;font-size:clamp(13px,1.7vw,15px);line-height:1.55;color:#4a5a52;}',
    ".jzp-ban a{color:#128BA5;font-weight:600;white-space:nowrap;}",
    ".jzp-x{position:absolute;right:6px;top:4px;border:0;background:none;color:#8aa;font-size:20px;line-height:1;cursor:pointer;padding:6px;}",
    ".jzp-x:hover{color:#128BA5;}",
    ".jzp-badge{position:absolute;left:-26px;top:-26px;width:64px;height:64px;animation:jzpPulse 1.3s ease-in-out infinite;pointer-events:none;}",
    "@keyframes jzpPulse{0%,100%{transform:scale(1) rotate(-12deg)}50%{transform:scale(1.12) rotate(-6deg)}}",
    ".jzp-ban.calm .jzp-badge{animation:none;transition:transform .5s ease-out;transform:scale(1) rotate(-12deg);}",
    "#jzPromoBar{position:fixed;left:0;right:0;bottom:0;z-index:99999;display:flex;align-items:center;gap:12px;background:#d0e0ec;border-top:2px solid #A9C5A0;padding:12px 48px 12px 14px;font-size:15px;box-shadow:0 4px 12px rgba(0,0,0,.08);}",
    "#jzPromoBar svg{width:34px;height:auto;flex:0 0 auto;}",
    "#jzPromoBar b{color:#128BA5;}",
    "#jzPromoBar a{color:hsl(var(--accent-hsl));font-weight:600;text-decoration:underline;}",
    "#jzPromoBar{cursor:pointer;}",
    "#jzPromoBar .jzp-x{top:50%;transform:translateY(-50%);}",
    "@media (max-width:640px){",
    " .jzp-flyer{top:22%;}",
    " .jzp-bird{width:107px;}",
    " .jzp-tow{width:32px;}",
    " .jzp-ban{max-width:66vw;padding:14px 18px;min-height:0;}",
    " .jzp-badge{width:48px;height:48px;left:-18px;top:-18px;}",
    " .jzp-x{font-size:24px;padding:8px;}",
    "}",
  ].join("");

  var star = (function () {
    var p = [],
      N = 16;
    for (var i = 0; i < N * 2; i++) {
      var r = i % 2 === 0 ? 48 : 38,
        a = (Math.PI * i) / N;
      p.push((50 + r * Math.cos(a)).toFixed(1) + "," + (50 + r * Math.sin(a)).toFixed(1));
    }
    return p.join(" ");
  })();

  var badge =
    '<svg class="jzp-badge" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><polygon fill="#D7263D" points="' +
    star +
    '"/><circle cx="50" cy="50" r="30" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 3"/><text x="50" y="56" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="19" font-weight="bold" fill="#fff" letter-spacing="1">NEW</text></svg>';

  var BIRD =
    '<svg class="jzp-bird" viewBox="-21 -40 529 548" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(0,504) scale(0.1,-0.1)" fill="#1BA8C6"><path d="M2580 3009 c-67 -13 -118 -55 -182 -149 -32 -47 -76 -105 -97 -129 -39 -43 -41 -44 -91 -39 -31 3 -58 12 -68 23 -16 16 -16 17 6 10 30 -9 28 9 -5 35 -27 21 -27 21 -68 -20 -29 -29 -48 -61 -65 -108 -44 -126 -31 -114 -97 -88 -151 62 -394 116 -583 132 -82 7 -82 7 -156 -67 -74 -73 -74 -73 -74 -154 1 -203 37 -390 104 -529 39 -81 55 -103 153 -198 110 -108 110 -108 169 -107 59 1 59 1 14 11 -76 17 -76 17 -42 38 39 24 72 75 72 111 0 33 48 100 92 127 34 21 103 43 111 36 2 -3 -4 -28 -14 -57 -10 -29 -32 -113 -49 -187 -18 -74 -40 -148 -49 -163 -55 -97 -381 -272 -597 -322 -38 -9 -96 -24 -129 -34 -188 -59 -307 -82 -530 -101 -118 -10 -265 -8 -338 6 -15 3 -27 1 -27 -5 0 -5 28 -13 63 -17 55 -7 58 -8 30 -15 -79 -16 -123 -74 -123 -161 0 -32 4 -58 10 -58 6 0 10 -7 10 -16 0 -9 14 -43 31 -75 58 -109 175 -192 288 -206 44 -5 51 -9 60 -36 6 -16 11 -44 11 -62 0 -79 106 -217 205 -265 41 -21 65 -25 136 -25 78 0 89 2 122 28 36 28 36 28 43 0 4 -15 13 -37 20 -48 21 -30 110 -82 165 -96 27 -7 49 -16 49 -21 0 -4 38 -8 85 -8 50 0 85 4 85 10 0 6 7 10 17 10 25 0 103 49 103 65 0 8 5 15 10 15 6 0 10 -6 10 -14 0 -8 15 -26 33 -40 17 -15 37 -31 44 -36 14 -12 240 -14 245 -2 2 4 27 18 57 32 66 30 111 73 111 105 0 18 4 23 15 19 29 -11 15 18 -36 74 -62 70 -116 177 -130 259 -24 134 49 325 197 516 95 124 105 129 244 117 116 -11 146 -24 76 -34 -63 -10 -89 -38 -83 -89 7 -52 14 -56 40 -24 12 15 41 40 65 56 23 15 39 30 36 34 -4 4 -1 13 6 22 7 8 10 22 6 30 -12 32 13 13 43 -32 35 -52 40 -75 13 -50 -20 18 -42 22 -42 9 0 -5 23 -32 50 -61 28 -29 50 -56 50 -61 0 -16 21 -22 35 -10 8 7 15 21 15 32 0 17 3 18 15 8 38 -31 50 43 12 78 -13 12 -37 25 -55 28 -24 5 -37 16 -48 41 -21 44 -53 68 -125 94 -32 12 -63 27 -68 33 -16 19 53 92 115 120 30 14 69 35 86 47 24 17 43 22 84 20 41 -1 54 1 54 12 0 8 11 19 24 25 14 6 71 44 127 84 189 134 537 493 626 646 26 44 26 44 -48 119 -70 71 -181 165 -330 281 -67 51 -94 83 -82 96 9 8 6 8 -57 -9 -81 -22 -80 -22 -80 38 0 48 3 55 25 65 33 15 32 32 -5 67 -17 16 -30 39 -30 52 0 82 -104 135 -220 112z" fill="#fff"/><g><animateTransform attributeName="transform" type="rotate" values="-15 2030 3000;11 2030 3000;-15 2030 3000" dur="0.62s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1" keyTimes="0;.42;1"/><path d="M220 5037 c0 -2 22 -26 48 -53 35 -36 52 -64 61 -100 7 -27 22 -74 33 -104 10 -30 28 -113 39 -185 17 -114 18 -164 13 -400 -3 -148 -9 -276 -13 -285 -5 -8 -11 -46 -14 -85 -4 -38 -11 -71 -16 -73 -17 -6 -50 -122 -71 -247 -28 -168 -26 -304 5 -443 14 -61 25 -132 25 -158 0 -25 12 -93 26 -151 32 -131 26 -155 -11 -43 -33 103 -50 126 -40 55 10 -74 69 -246 125 -362 211 -444 645 -762 1060 -779 84 -3 90 -2 50 7 -76 18 -76 18 -42 39 38 23 72 75 72 110 0 14 9 38 20 55 19 29 19 29 -3 53 -12 13 -32 28 -45 33 -41 16 -94 182 -110 347 -7 68 -6 79 8 76 8 -2 60 -10 115 -20 112 -19 284 -68 391 -112 72 -30 72 -30 171 72 110 111 156 184 203 321 43 127 32 180 -26 119 -32 -35 -36 -36 -85 -32 -30 3 -57 12 -67 23 -16 16 -16 17 7 10 45 -14 16 18 -80 88 -103 75 -243 190 -301 250 -119 120 -223 319 -263 502 -23 106 -38 120 -33 32 2 -37 0 -67 -3 -67 -24 0 -78 144 -114 300 -26 119 -77 284 -102 332 -7 15 -13 30 -13 33 0 8 -50 106 -70 135 -9 14 -44 66 -76 115 -132 201 -404 424 -671 549 -35 16 -63 33 -63 38 0 4 -31 8 -70 8 -38 0 -70 -1 -70 -3z M1691 1623 c-7 -32 -20 -69 -28 -83 -9 -14 10 0 41 30 56 54 56 54 29 82 -15 15 -27 28 -28 28 0 0 -6 -26 -14 -57z" fill="#fff"/><path d="M331 5016 c2 -2 47 -29 99 -61 280 -169 503 -374 642 -590 100 -155 168 -316 254 -605 25 -85 53 -166 60 -180 16 -27 15 -23 -5 55 -6 22 -25 99 -41 170 -79 338 -189 568 -366 766 -139 155 -325 295 -530 398 -88 44 -129 61 -113 47z "/><path d="M396 4588 c5 -18 9 -168 9 -333 1 -302 4 -332 42 -450 22 -68 82 -199 88 -193 3 3 -8 46 -24 96 -54 165 -64 242 -66 522 -1 235 -3 260 -23 323 -23 68 -42 94 -26 35z "/><path d="M341 3713 c-53 -134 -75 -389 -47 -553 28 -158 120 -389 191 -475 20 -24 19 -23 -44 130 -116 280 -146 545 -97 840 8 44 13 81 11 83 -1 1 -7 -10 -14 -25z "/><path d="M1464 3570 c4 -117 41 -234 113 -352 79 -132 195 -234 453 -400 159 -101 150 -92 -60 64 -85 63 -184 146 -219 184 -136 145 -229 325 -276 534 l-15 65 4 -95z "/><path d="M306 2765 c3 -22 19 -80 35 -130 76 -228 202 -429 378 -605 161 -160 318 -259 512 -324 86 -29 247 -59 287 -54 18 2 3 8 -43 16 -367 68 -712 310 -948 667 -66 101 -164 294 -202 400 -20 55 -24 61 -19 30z "/></g><g><animateTransform attributeName="transform" type="rotate" values="15 2600 2900;-11 2600 2900;15 2600 2900" dur="0.62s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1" keyTimes="0;.42;1"/><path d="M4570 4098 c0 -7 9 -40 19 -73 10 -33 29 -113 41 -177 13 -65 27 -118 33 -118 5 0 7 47 5 109 -1 60 1 107 6 104 4 -3 17 -24 27 -47 36 -79 19 -183 -47 -291 -20 -33 -44 -73 -52 -90 -23 -44 -214 -232 -307 -301 -100 -75 -201 -144 -212 -144 -5 0 -26 -9 -47 -21 -62 -33 -60 -18 4 34 33 26 60 54 60 62 0 21 -14 19 -47 -9 -132 -111 -426 -248 -738 -344 -134 -42 -472 -132 -493 -132 -8 0 -12 19 -12 53 0 48 3 55 25 65 33 15 32 36 -3 61 -29 20 -29 20 -120 -72 -91 -92 -91 -92 -75 -124 20 -43 246 -261 359 -348 49 -38 93 -72 98 -76 16 -14 -120 -200 -193 -264 -63 -56 -216 -162 -296 -205 -55 -30 -107 -70 -168 -129 -134 -131 -156 -189 -93 -250 34 -33 34 -33 77 -11 24 13 57 32 73 43 20 14 42 20 68 18 55 -3 296 26 413 50 126 26 129 27 133 29 1 2 5 3 10 5 4 1 24 9 44 18 21 10 42 17 48 17 12 0 217 77 245 93 11 6 52 27 90 47 149 77 330 214 444 336 101 109 223 285 207 301 -3 3 -12 0 -21 -7 -19 -15 -19 -14 1 43 11 33 28 56 57 79 150 114 255 259 296 408 24 85 25 90 11 90 -5 0 -16 -16 -24 -35 -15 -35 -15 -35 -48 -2 -33 32 -33 32 23 94 118 132 218 317 234 433 4 30 13 70 21 89 10 24 14 84 14 223 0 222 -3 232 -100 321 -59 55 -90 70 -90 45z" fill="#fff"/><path d="M4545 4103 c16 -43 53 -195 65 -270 8 -45 17 -80 22 -77 10 6 9 100 -1 174 -5 30 -7 57 -5 58 1 2 14 -14 29 -36 142 -214 -116 -579 -634 -896 -68 -41 -126 -78 -130 -82 -3 -4 48 21 114 55 233 121 463 295 579 438 57 72 122 179 132 219 3 13 10 24 15 24 5 0 9 47 9 105 0 58 -4 105 -8 105 -5 0 -17 18 -27 41 -11 23 -48 67 -84 100 -68 61 -88 72 -76 42z "/><path d="M4670 3426 c-17 -51 -125 -228 -199 -325 -36 -47 -102 -122 -147 -168 -112 -113 -82 -108 59 11 122 103 265 323 298 459 14 57 6 74 -11 23z "/><path d="M3965 3105 c-222 -149 -533 -268 -1065 -410 l-95 -25 66 5 c153 10 470 90 662 166 205 82 399 194 482 279 21 22 37 40 35 40 -3 -1 -41 -25 -85 -55z "/><path d="M4486 2900 c-65 -163 -235 -365 -400 -479 -26 -18 -45 -35 -43 -38 3 -2 31 9 64 25 175 89 322 257 383 441 25 76 23 116 -4 51z "/><path d="M4115 2283 c-286 -375 -742 -644 -1285 -758 -69 -14 -165 -29 -214 -32 -69 -5 -84 -8 -65 -15 45 -17 275 8 449 48 482 113 897 388 1124 747 44 69 40 74 -9 10z "/></g><path d="M2502 3000 c-55 -32 -94 -78 -145 -173 -17 -32 -47 -72 -66 -88 -25 -20 -30 -29 -18 -29 22 0 91 69 150 152 55 77 114 118 183 126 63 7 127 -20 147 -61 16 -32 16 -32 -11 -38 -71 -15 -96 -61 -50 -93 29 -20 61 -20 99 0 40 20 34 25 -16 14 -42 -9 -75 1 -75 24 0 29 63 35 98 10 35 -24 38 -9 4 16 -20 15 -28 28 -25 43 3 12 -6 37 -19 56 -53 77 -162 95 -256 41z "/><path d="M2502 2908 c-7 -7 -12 -20 -12 -30 0 -14 8 -18 34 -18 37 0 49 15 34 43 -10 20 -39 22 -56 5z "/><path d="M2505 2720 c-89 -57 -110 -64 -160 -58 -42 5 -44 1 -9 -12 42 -17 90 -1 177 57 91 61 94 63 81 63 -6 0 -46 -23 -89 -50z "/><path d="M2760 2728 c0 -24 -7 -80 -15 -126 -11 -67 -12 -100 -3 -165 45 -334 -106 -710 -406 -1013 -104 -105 -74 -95 44 14 293 271 443 621 407 952 -5 47 -8 149 -7 227 0 89 -3 144 -10 148 -6 4 -10 -10 -10 -37z "/><path d="M1665 1991 c-49 -23 -99 -74 -119 -123 -22 -53 -19 -59 8 -16 45 75 93 109 170 124 38 7 39 6 32 -17 -4 -13 -28 -107 -54 -209 -46 -183 -47 -185 -93 -231 -148 -150 -608 -321 -1036 -386 -70 -10 -179 -16 -311 -17 -148 -1 -192 -4 -165 -10 71 -18 446 -13 578 8 271 41 523 119 745 228 124 61 155 81 211 137 l66 66 27 120 c15 66 39 161 53 210 42 148 44 135 -18 135 -31 0 -71 -8 -94 -19z "/><path d="M2136 1489 c-16 -5 -41 -20 -57 -35 -23 -22 -37 -27 -86 -28 -39 -1 -69 -7 -87 -19 -34 -23 -29 -31 9 -17 16 6 55 10 86 9 54 -2 61 0 99 34 49 45 88 53 49 10 l-24 -26 25 16 c13 9 35 17 48 17 19 0 21 3 13 19 -13 23 -38 30 -75 20z "/><path d="M2156 1385 c17 -13 14 -14 -39 -9 -105 9 -111 -8 -7 -22 52 -6 97 -10 99 -8 10 9 -32 54 -51 54 -21 0 -21 0 -2 -15z "/><path d="M1949 1333 c-20 -49 -15 -84 15 -110 25 -21 66 -32 66 -16 0 3 -7 14 -15 23 -10 11 -16 39 -17 74 -1 31 -3 56 -4 56 -2 0 -10 -21 -19 -47 l-15 -48 6 48 c6 53 -1 61 -17 20z "/><path d="M1875 1325 c-45 -27 -74 -31 -94 -12 -11 10 -13 9 -9 -3 3 -8 15 -20 28 -27 28 -14 63 -3 110 37 43 36 21 40 -35 5z "/><path d="M2240 1269 c14 -12 53 -35 87 -50 57 -27 113 -79 113 -107 0 -6 12 -25 26 -42 38 -45 21 -49 -26 -6 -56 50 -59 45 -9 -14 23 -27 46 -50 50 -50 4 0 11 -9 14 -20 9 -27 23 -25 37 5 10 22 7 32 -24 78 -19 28 -46 70 -60 92 -26 41 -41 51 -163 104 -59 26 -66 28 -45 10z "/><path d="M2018 1143 c-93 -90 -158 -173 -207 -264 -56 -103 -74 -181 -69 -295 3 -79 8 -100 38 -160 21 -44 56 -92 96 -131 78 -79 103 -83 34 -5 -102 114 -145 249 -122 383 24 138 86 256 230 437 45 56 79 102 76 102 -3 0 -37 -30 -76 -67z "/><path d="M2134 1192 c9 -10 46 -17 108 -22 51 -4 102 -10 113 -14 18 -7 18 -5 -3 12 -22 20 -52 26 -180 35 -48 4 -52 3 -38 -11z "/><path d="M2296 1130 c-43 -13 -66 -39 -66 -76 0 -39 17 -54 28 -24 4 12 30 34 57 51 37 21 44 29 28 29 -12 0 -24 -4 -27 -9 -3 -5 -21 -14 -38 -20 l-33 -11 28 25 c15 14 37 25 47 25 10 0 22 5 25 10 7 12 -9 12 -49 0z "/><path d="M2524 1077 c16 -13 29 -34 30 -48 1 -28 29 -33 34 -6 4 21 -50 77 -75 77 -14 0 -12 -5 11 -23z "/><path d="M0 905 c0 -14 4 -25 8 -25 4 0 14 -17 21 -37 76 -211 281 -311 524 -257 69 15 285 109 275 119 -3 3 -25 -4 -49 -14 -114 -51 -220 -74 -339 -75 -115 -1 -117 -1 -192 37 -92 45 -155 110 -201 208 -34 73 -47 85 -47 44z "/><path d="M420 459 c48 -165 258 -304 393 -260 52 17 80 43 149 134 34 45 64 84 67 87 3 3 13 14 21 24 39 51 -40 -19 -113 -99 -43 -47 -93 -93 -109 -101 -43 -22 -129 -15 -193 16 -61 30 -165 130 -194 188 -25 50 -33 54 -21 11z "/><path d="M1501 453 c-5 -10 -24 -72 -42 -138 -28 -103 -38 -125 -69 -157 -45 -46 -103 -62 -195 -55 -87 6 -177 37 -227 77 -49 40 -50 22 -1 -20 44 -39 123 -78 176 -86 20 -4 37 -10 37 -15 0 -5 25 -9 56 -9 34 0 53 4 49 10 -3 6 3 10 15 10 26 0 77 25 108 54 38 34 53 71 77 195 13 64 27 124 30 134 4 9 5 17 1 17 -3 0 -9 -8 -15 -17z "/><path d="M1810 123 c-125 -43 -231 -46 -305 -8 -27 13 -51 23 -53 21 -5 -6 72 -66 85 -66 7 0 13 -4 13 -10 0 -6 40 -10 100 -10 60 0 100 4 100 10 0 6 6 10 13 10 27 0 159 74 146 83 -2 1 -47 -12 -99 -30z"/></g></svg>';

  function openPromo() {
    window.open(_promolinkurl, "_blank", "noopener");
  }

  function showBar() {
    var bar = document.createElement("div");
    bar.id = "jzPromoBar";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Announcement");
    bar.innerHTML =
      BIRD.replace('class="jzp-bird"', "") +
      "<span><b>" +
      esc(_promotitle) +
      "</b> \u2014 " +
      esc(_promocopy) +
      ' <a target="_blank" rel="noopener" href="' +
      esc(_promolinkurl) +
      '">' +
      esc(_promolinktext) +
      "</a></span>" +
      '<button class="jzp-x" aria-label="Dismiss">\u00d7</button>';
    document.body.appendChild(bar);
    bar.querySelector(".jzp-x").addEventListener("click", function (e) {
      e.stopPropagation();
      flagSet(KILL);
      bar.remove();
    });
    bar.addEventListener("click", function (e) {
      if (e.target.closest(".jzp-x")) return;
      if (!e.target.closest("a")) openPromo();
    });
  }

  function showAnimated() {
    var layer = document.createElement("div");
    layer.id = "jzPromo";
    layer.setAttribute("role", "dialog");
    layer.setAttribute("aria-label", "Announcement");
    layer.innerHTML =
      '<div class="jzp-flyer"><div class="jzp-rig">' +
      '<div class="jzp-ban">' +
      badge +
      '<button class="jzp-x" aria-label="Dismiss">\u00d7</button>' +
      "<h3>" +
      esc(_promotitle) +
      "</h3>" +
      "<p>" +
      esc(_promocopy) +
      ' <a target="_blank" rel="noopener" href="' +
      esc(_promolinkurl) +
      '">' +
      esc(_promolinktext) +
      " \u2192</a></p>" +
      "</div>" +
      '<svg class="jzp-tow" viewBox="0 0 56 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M0 7 Q28 13 56 7"/></svg>' +
      BIRD +
      "</div></div>";
    document.body.appendChild(layer);
    var fly = layer.querySelector(".jzp-flyer"),
      ban = layer.querySelector(".jzp-ban");
    // var prevOv = document.body.style.overflow; crops the page, removes scrollbar.
    // document.body.style.overflow = "hidden";

    function center() {
      var w = fly.getBoundingClientRect().width || 580;
      fly.style.setProperty("--jzc", Math.max(4, (window.innerWidth - w) / 2) + "px");
    }
    center();
    window.addEventListener("resize", center);

    function close() {
      layer.classList.remove("dim");
      fly.classList.remove("hov", "stillbob");
      fly.classList.add("outfly");
      fly.addEventListener(
        "animationend",
        function (e) {
          if (e.animationName !== "jzpOut") return;
          layer.remove();
          // document.body.style.overflow = prevOv; use with var prevOv if you want to prevent page scrolling
          window.removeEventListener("resize", center);
        },
        { once: true },
      );
    }

    fly.addEventListener("animationend", function onIn(e) {
      if (e.animationName !== "jzpIn") return;
      fly.removeEventListener("animationend", onIn);
      fly.classList.remove("in");
      fly.classList.add("hov");
    });
    /* dim + fly-in start together */
    layer.classList.add("dim");
    fly.classList.add("in");

    function still() {
      if (!fly.classList.contains("hov")) return;
      fly.classList.add("stillbob");
      var t = getComputedStyle(ban).transform;
      ban.style.transform = t === "none" ? "" : t;
      ban.classList.add("calm");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          ban.style.transform = "none";
        });
      });
    }
    function unstill() {
      fly.classList.remove("stillbob");
      ban.classList.remove("calm");
      ban.style.transform = "";
    }
    ban.addEventListener("mouseenter", still);
    ban.addEventListener("mouseleave", unstill);
    ban.addEventListener("touchstart", still, { passive: true });

    layer.addEventListener("click", function (e) {
      if (!ban.contains(e.target)) close();
    });
    ban.querySelector(".jzp-x").addEventListener("click", function (e) {
      e.stopPropagation();
      close();
    });
    ban.addEventListener("click", function (e) {
      if (e.target.closest(".jzp-x")) return;
      if (!e.target.closest("a")) openPromo();
    });
  }

  function boot() {
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
    /* bar is always shown on allowed pages (unless killed, handled above) */
    showBar();
    /* animation runs once per session, on the first allowed page only */
    if (!inIframe && !reduced && !flagGet(ANIM)) {
      flagSet(ANIM);
      showAnimated();
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
