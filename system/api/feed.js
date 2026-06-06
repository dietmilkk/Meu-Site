var path = require("path");
var fs = require("fs");
var crypto = require("crypto");

function decrypt(key, b64) {
  var enc = Buffer.from(b64, "base64");
  var keyBuf = Buffer.from(key, "utf8");
  var dec = Buffer.alloc(enc.length);
  for (var i = 0; i < enc.length; i++) {
    dec[i] = enc[i] ^ keyBuf[i % keyBuf.length];
  }
  return dec.toString("utf8");
}

module.exports = function (req, res) {
  res.setHeader("Cache-Control", "no-cache");

  var secret = process.env.FEED_SECRET || "";
  if (!secret) {
    res.status(500).json({ error: "FEED_SECRET not configured" });
    return;
  }
  var auth = req.headers["authorization"] || "";
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
    var match = content.match(/module\.exports\s*=\s*"([^"]+)"/);
    if (!match) {
      res.status(500).json({ error: "Invalid feed data" });
      return;
    }
    var decrypted = decrypt(secret, match[1]);
    var data = JSON.parse(decrypted);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
