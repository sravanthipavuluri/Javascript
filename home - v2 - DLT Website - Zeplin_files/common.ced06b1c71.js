/* eslint-disable strict */

(function () {
    "use strict";

    var os = (function () {
        if (/iPad|iPhone/.test(navigator.userAgent)) {
            return "ios";
        } else if (/Macintosh/.test(navigator.userAgent)) {
            return "mac";
        } else if (/Windows/.test(navigator.userAgent)) {
            return "win";
        } else if (/Linux/.test(navigator.userAgent) || /X11/.test(navigator.userAgent)) {
            return "linux";
        }
        return "unknown";
    }());

    document.body.classList.add(os);

    var device = (function () {
        if (/Mobi/.test(navigator.userAgent)) {
            return "mobile";
        }
        return "desktop";
    }());

    document.body.classList.add(device);

    var browser = (function () {
        if (/Firefox/.test(navigator.userAgent)) {
            return "firefox";
        } else if (/OPR/.test(navigator.userAgent)) {
            return "opera";
        } else if (/Chrome/.test(navigator.userAgent)) {
            return "chrome";
        } else if (/Safari/.test(navigator.userAgent)) {
            return "safari";
        } else if (/Edge/.test(navigator.userAgent)) {
            return "edge";
        }
        return "unknown";
    }());

    document.body.classList.add(browser);

    document.body.classList.toggle("canDownload", "download" in document.createElement("a"));
    document.body.classList.toggle("electron", (typeof process) === "object");
    document.body.classList.toggle("esfp", document.elementsFromPoint);

    if ("Raven" in window) {
        // TODO: Raven should be inside its own (AMD) module
        // Ignore URLs
        // https://docs.getsentry.com/hosted/clients/javascript/tips/#decluttering-sentry
        var ravenOptions = {
            release: "6.19.2",
            ignoreUrls: [
                // Stripe
                /\.stripe\.com/i,
                // Intercom
                /widget\.intercom\.io/i,
                /js\.intercomcdn\.com/i,
                // Pusher
                /js\.pusher\.com/i,
                // Chrome extensions
                /extensions\//i,
                /^chrome:\/\//i,
                /^chrome-extension:\/\//i,
                // Ignore errors of vendor scripts.
                /vendor-[\w.-]+\.js/i
            ],
            ignoreErrors: [
                // Ignore fetch errors. Requests cancelled by browsers cause fetch to reject.
                // Since it is not possible to tell if it is a cancelled request or a failure we have to ignore them all :(
                /^Failed to fetch/i,
                /^NetworkError when attempting to fetch resource/i,
                /^Network request failed/i,
                /docs-homescreen-gb-container/i
            ]
        };
        Raven.config("https://005c26d193b24ce099639f75fb5fbc85@app.getsentry.com/83039", ravenOptions).install();

        // Log unhandled promise rejections on Sentry
        // Browser support: Chrome 49, could we use this?
        window.addEventListener("unhandledrejection", function (event) {
            if (!event || !event.reason) {
                return;
            }

            Raven.captureException(event.reason, {
                extra: { unhandledPromise: true }
            });
        });
    }

    if (!window.Zeplin) {
        window.Zeplin = {};
    }

    Zeplin.updateUser = function (data) {
        Object.assign(Zeplin.user, data);
        localStorage.setItem("user", JSON.stringify(Zeplin.user));
    };

    if (!Zeplin.user) {
        var tmpUser = localStorage.getItem("user");

        if (tmpUser) {
            try {
                window.Zeplin.user = JSON.parse(tmpUser);
            } catch (err) {
                localStorage.removeItem("user");
            }
        }
    }

    if ("Raven" in window) {
        if (Zeplin.user) {
            Raven.setUserContext({
                username: Zeplin.user.username,
                id: Zeplin.user._id
            });
        } else {
            // Invalidate user context if there is no logged-in user
            Raven.setUserContext();
        }
    }

    Zeplin.urls = Object.freeze({
        appURL: "https://app.zeplin.io",
        baseURL: "https://api.zeplin.io",
        imgURL: "https://img.zeplin.io",
        webURL: "https://zeplin.io"
    });

    Zeplin.KEY_CODE = Object.freeze({
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        ALT: 18,
        ESC: 27,
        SPACE: 32,
        ArrowLeft: 37,
        ArrowUp: 38,
        ArrowRight: 39,
        ArrowDown: 40,
        Digit0: 48,
        KeyA: 65,
        KeyD: 68,
        KeyF: 70,
        KeyJ: 74,
        KeyS: 83,
        KeyT: 84,
        KeyMinusGecko: 173,
        KeyMinusWebkit: 189,
        KeyEqualGecko: 61,
        KeyEqualWebkit: 187
    });

    Zeplin.MOUSE_BUTTON = Object.freeze({
        LEFT: 0,
        MIDDLE: 1,
        RIGHT: 2
    });

    var domain = /^[\d.]+$/.test(location.hostname)
        ? location.hostname
        : location.hostname.substr(location.hostname.indexOf("."));
    Cookies.defaults = {
        path: "/",
        domain: domain,
        expires: Infinity,
        secure: "secure" === "secure"
    };

    Zeplin.headers = new Headers();
    Zeplin.headers.set("Content-Type", "application/json");
    if (Cookies.get("userToken")) {
        window.Zeplin.headers.set("Zeplin-Token", Cookies.get("userToken"));
    }

    /* eslint-disable */

    // Google Analytics
    (function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,"script","//www.google-analytics.com/analytics.js","ga");

    // Legacy tracker
    ga("create", "UA-51352708-4", "auto", "legacyTracker");
    ga("legacyTracker.require", "linkid", "linkid.js");
    ga("legacyTracker.require", "displayfeatures");

    if (Zeplin.user) {
        ga("legacyTracker.set", "&uid", Zeplin.user._id);
    }

    ga("legacyTracker.send", "pageview");

    // Next-gen tracker
    ga("create", {
        trackingId: "UA-51352708-8",
        cookieDomain: "auto"
    });
    ga("require", "linkid");
    ga("require", "displayfeatures");
    ga("set", "transport", "beacon");

    if (Zeplin.user) {
        ga("set", "userId", Zeplin.user._id);
    }

    // Mixpanel
    (function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);

    mixpanel.init("8e2050dc40d37740b8825eebb37415a9");
    if (Zeplin.user) {
        mixpanel.identify(Zeplin.user._id);
    }

    // Facebook Pixel
    (function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
    })(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");

    if (Zeplin.user) {
        fbq("init", "1654544691505740", { em: Zeplin.user.email });
    } else {
        fbq("init", "1654544691505740");
    }
    fbq("track", "PageView");

    // Twitter universal website tag code
    !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
    },s.version="1.1",s.queue=[],u=t.createElement(n),u.async=!0,u.src="//static.ads-twitter.com/uwt.js",
    a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,"script");
    twq("init","nwe8t");
    twq("track","PageView");

    /* eslint-enable */

    Zeplin.requireLogin = function (redirectTo) {
        if (redirectTo !== false) {
            sessionStorage.setItem("redirectTo", redirectTo || location.href);
        }

        location.replace("/login");
    };

    Zeplin.redirectBack = function () {
        var redirectTo = sessionStorage.getItem("redirectTo");

        sessionStorage.removeItem("redirectTo");
        location.replace(redirectTo || "/projects");
    };

    window.addEventListener("storage", function (ev) {
        if (ev.storageArea === localStorage && ev.key === "user") {
            var oldUserObj = JSON.parse(ev.oldValue),
                newUserObj = JSON.parse(ev.newValue);

            if (!newUserObj) {
                Zeplin.requireLogin();
                return;
            }

            if (!oldUserObj && newUserObj) {
                Zeplin.redirectBack();
            }
        }
    });

    window.addEventListener("online", function () {
        if (!Cookies.get("userToken")) {
            Zeplin.requireLogin();
        }
    });
}());
