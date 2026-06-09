(function(global) {
  "use strict";

  global.fetchGeo = function() {
    return fetch("https://ipinfo.io/json")
      .then(function(r) {
        if (!r.ok) return Promise.reject(new Error("HTTP " + r.status));
        return r.json();
      })
      .then(function(d) {
        if (d.error) return Promise.reject(new Error(d.reason || "geo failed"));
        var loc = (d.loc || "").split(",");
        return {
          ip: d.ip,
          city: d.city,
          region: d.region,
          country: d.country,
          postal: d.postal,
          isp: d.org,
          org: d.org,
          lat: loc[0] ? parseFloat(loc[0]) : null,
          lon: loc[1] ? parseFloat(loc[1]) : null,
          timezone: d.timezone
        };
      });
  };
})(window);
