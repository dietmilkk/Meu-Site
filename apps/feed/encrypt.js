var fs = require("fs");
var path = require("path");

var key = process.env.FEED_SECRET || "default-feed-key-2024";
var output = path.join(__dirname, "feed-data.js");

var data = [
  {
    "date": "2025-12-25",
    "image": "apps/feed/media/placeholder.jpg",
    "text": "Natal! 🎄 Tempo de celebrar com quem amamos."
  },
  {
    "date": "2025-12-20",
    "image": "apps/feed/media/placeholder.jpg",
    "text": "Mais um dia de coding. O setup tá ficando lindo ✨"
  },
  {
    "date": "2025-11-15",
    "image": "apps/feed/media/placeholder.jpg",
    "text": "Final de semana de jogos retrô e nostalgia."
  }
];

var json = JSON.stringify(data);
var buf = Buffer.from(json, "utf8");
var keyBuf = Buffer.from(key, "utf8");
var enc = Buffer.alloc(buf.length);
for (var i = 0; i < buf.length; i++) {
  enc[i] = buf[i] ^ keyBuf[i % keyBuf.length];
}
var b64 = enc.toString("base64");

var out = 'module.exports = "' + b64 + '";\n';
fs.writeFileSync(output, out, "utf8");
console.log("Encrypted " + json.length + " bytes -> " + b64.length + " base64 chars");
