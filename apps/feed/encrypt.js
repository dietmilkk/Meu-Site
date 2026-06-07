var fs = require("fs");
var path = require("path");
var crypto = require("crypto");

/* ----- Read secret from .env or environment ----- */
var secret = (function () {
  var envPath = path.resolve(__dirname, "..", "..", ".env");
  try {
    var lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (var i = 0; i < lines.length; i++) {
      var m = lines[i].match(/^\s*FEED_SECRET\s*=\s*(.+)\s*$/);
      if (m) return m[1].replace(/["']/g, "");
    }
  } catch (e) {}
  return process.env.FEED_SECRET || "default-feed-key-2024";
})();

var output = path.join(__dirname, "feed-data.js");
var feedJsPath = path.join(__dirname, "feed.js");

/* ----- Post data — edit this array to add/change posts ----- */
var data = [
  {
    "date": "2026-01-15",
    "image": "",
    "text": "Primeira postagem do ano! Finalmente organizei meu setup do jeito que eu queria. CRT + thinkpad + café = combinação perfeita.",
    "restricted": false
  },
  {
    "date": "2026-01-10",
    "image": "",
    "text": "Mais um dia de coding. O terminal nunca me abandona ❤️",
    "restricted": false
  },
  {
    "date": "2026-01-05",
    "image": "",
    "text": "Final de semana de jogos retrô e nostalgia. DOOM eternalmente no coração.",
    "restricted": false
  },
  {
    "date": "2025-12-28",
    "image": "",
    "text": "Foto aleatória de mim sendo uma pessoa normal totalmente padrao e nada disfuncional :D",
    "restricted": true
  },
  {
    "date": "2025-12-20",
    "image": "",
    "text": "Conteúdo sensível — só pra maiores. Arte alternativa e expressão livre.",
    "restricted": true
  },
  {
    "date": "2025-12-15",
    "image": "apps/gallery/media/seila12.jpg",
    "text": "Paisagem dahora que eu fotografei. A natureza é linda demais.",
    "restricted": false
  },
  {
    "date": "2025-12-10",
    "image": "",
    "text": "Mais um autorretrato... ou não. Quem sabe.",
    "restricted": true
  },
  {
    "date": "2025-12-05",
    "image": "apps/gallery/media/seila10.jpg",
    "text": "Comida aleatória que eu fiz. Ficou bonita pelo menos.",
    "restricted": false
  },
  {
    "date": "2026-06-07",
    "image": "apps/gallery/media/seila14.gif",
    "text": "VTubers BR são mt underrated, essa wave nova tá vindo com tudo. Acompanhem a cena!",
    "restricted": false
  }
];

var key = crypto.createHash("sha256").update(secret, "utf8").digest();

/* ---------------------------------------------------------------
   Step 1: Encrypt full JSON → feed-data.js (for Vercel API)
   --------------------------------------------------------------- */
var iv = crypto.randomBytes(16);
var cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
var json = JSON.stringify(data);
var enc = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
var apiOut = 'module.exports = "' + iv.toString("hex") + ":" + enc.toString("hex") + '";\n';
fs.writeFileSync(output, apiOut, "utf8");
console.log("✓ feed-data.js — " + json.length + " bytes → " + (enc.length + 16) + " bytes");

/* ---------------------------------------------------------------
   Step 2: Build mapping of restricted ciphertexts
   --------------------------------------------------------------- */
var restricted = {};
for (var i = 0; i < data.length; i++) {
  if (data[i].restricted) {
    var piv = crypto.randomBytes(16);
    var pcipher = crypto.createCipheriv("aes-256-cbc", key, piv);
    var penc = Buffer.concat([pcipher.update(data[i].text, "utf8"), pcipher.final()]);
    restricted[String(i)] = piv.toString("hex") + ":" + penc.toString("hex");
  }
}

/* ---------------------------------------------------------------
   Step 3: Patch feed.js with new ciphertexts (unless --dry-run)
   --------------------------------------------------------------- */
var doPatch = process.argv.indexOf("--patch") !== -1 || process.argv.indexOf("-p") !== -1;

if (doPatch) {
  var feedJs = fs.readFileSync(feedJsPath, "utf8");

  var keys = Object.keys(restricted).sort(function (a, b) {
    return parseInt(a) - parseInt(b);
  });
  var ri = 0;
  var lines = feedJs.split("\n");

  for (var li = 0; li < lines.length && ri < keys.length; li++) {
    var line = lines[li];
    /* "text" line followed by "restricted": true on the next line */
    if (/^\s*"text":/.test(line) && ri < keys.length) {
      var nextLine = lines[li + 1] || "";
      if (/"restricted"\s*:\s*true/.test(nextLine)) {
        lines[li] = line.replace(
          /("text":\s*")[^"]*/,
          '$1' + restricted[keys[ri]]
        );
        ri++;
      }
    }
  }

  fs.writeFileSync(feedJsPath, lines.join("\n"), "utf8");
  console.log("✓ feed.js — patched " + ri + " restricted post(s)");
} else {
  console.log("\n--- Restricted ciphertexts (use --patch to auto-update feed.js) ---");
  var keys = Object.keys(restricted).sort(function (a, b) { return parseInt(a) - parseInt(b); });
  for (var k = 0; k < keys.length; k++) {
    console.log("  [" + keys[k] + '] "' + restricted[keys[k]] + '"');
  }
  console.log("\nRun with --patch to apply:  node apps/feed/encrypt.js --patch");
}
