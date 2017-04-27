;(function (a) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], a)
    } else {
        if (typeof exports === "object") {
            a(require("jquery"))
        } else {
            a(jQuery)
        }
    }
}(function (a) {
    var c = /\+/g;

    function g(i) {
        return b.raw ? i : encodeURIComponent(i)
    }

    function h(i) {
        return b.raw ? i : decodeURIComponent(i)
    }

    function f(i) {
        return g(b.json ? JSON.stringify(i) : String(i))
    }

    function e(j) {
        if (j.indexOf('"') === 0) {
            j = j.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\")
        }
        try {
            j = decodeURIComponent(j.replace(c, " "));
            return b.json ? JSON.parse(j) : j
        } catch (i) {
        }
    }

    function d(i, j) {
        var k = b.raw ? i : e(i);
        return a.isFunction(j) ? j(k) : k
    }

    var b = a.cookie = function (s, q, p) {
        if (arguments.length > 1 && !a.isFunction(q)) {
            p = a.extend({}, b.defaults, p);
            if (typeof p.expires === "number") {
                var m = p.expires, o = p.expires = new Date();
                o.setTime(+o + m * 86400000)
            }
            return (document.cookie = [g(s), "=", f(q), p.expires ? "; expires=" + p.expires.toUTCString() : "", p.path ? "; path=" + p.path : "", p.domain ? "; domain=" + p.domain : "", p.secure ? "; secure" : ""].join(""))
        }
        var v = s ? undefined : {};
        var k = document.cookie ? document.cookie.split("; ") : [];
        for (var u = 0, w = k.length; u < w; u++) {
            var r = k[u].split("=");
            var n = h(r.shift());
            var j = r.join("=");
            if (s && s === n) {
                v = d(j, q);
                break
            }
            if (!s && (j = d(j)) !== undefined) {
                v[n] = j
            }
        }
        return v
    };
    b.defaults = {};
    a.removeCookie = function (j, i) {
        if (a.cookie(j) === undefined) {
            return false
        }
        a.cookie(j, "", a.extend({}, i, {expires: -1}));
        return !a.cookie(j)
    }
}));