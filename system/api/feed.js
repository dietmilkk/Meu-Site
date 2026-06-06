var path = require("path");
var fs = require("fs");

module.exports = function (req, res) {
  res.setHeader("Cache-Control", "no-cache");

  var auth = req.headers["authorization"] || "";
  var secret = process.env.FEED_SECRET || "";
  var authorized = false;
  if (secret && auth === "Bearer " + secret) {
    authorized = true;
  }

  if (!authorized) {
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || "";
    var country = req.headers["x-vercel-ip-country"] || "";
    var region = req.headers["x-vercel-ip-country-region"] || "";
    if (country === "BR" && region === "PE") {
      var lang = req.headers["accept-language"] || "";
      var msg = lang.indexOf("pt") === 0 ? "Indisponível na sua região" : "Not available in your region";
      res.status(403).json({ error: msg });
      return;
    }
  }

  var feedPath = path.join(process.cwd(), "apps", "feed", "feed-data.js");
  try {
    var content = fs.readFileSync(feedPath, "utf8");
    var match = content.match(/window\._feedData\s*=\s*(\[[\s\S]*?\])\s*;/);
    if (!match) {
      res.status(500).json({ error: "Invalid feed data" });
      return;
    }
    var data = JSON.parse(match[1]);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
