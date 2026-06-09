(function(global) {
  "use strict";

  global.fetchGeo = function() {
    return fetch("https://ipapi.co/json/")
      .then(function(r) {
        if (!r.ok) return Promise.reject(new Error("HTTP " + r.status));
        return r.json();
      })
      .then(function(d) {
        if (d.error) return Promise.reject(new Error(d.reason || "geo failed"));
        return {
          ip: d.ip,
          city: d.city,
          region: d.region,
          country: d.country_name,
          postal: d.postal,
          isp: d.org,
          org: d.org,
          lat: d.latitude,
          lon: d.longitude,
          timezone: d.timezone
        };
      });
  };
})(window);
