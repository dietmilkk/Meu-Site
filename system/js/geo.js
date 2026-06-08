(function(global) {
  "use strict";

  global.fetchGeo = function() {
    return fetch("https://ip-api.com/json/?fields=status,message,ip,city,region,country,postal,isp,org,lat,lon,timezone")
      .then(function(r) {
        if (!r.ok) return Promise.reject(new Error("HTTP " + r.status));
        return r.json();
      })
      .then(function(d) {
        if (d.status === "fail") return Promise.reject(new Error(d.message || "geo failed"));
        return {
          ip: d.ip,
          city: d.city,
          region: d.region,
          country: d.country,
          postal: d.postal,
          isp: d.isp || d.org,
          org: d.org,
          lat: d.lat,
          lon: d.lon,
          timezone: d.timezone
        };
      });
  };
})(window);
