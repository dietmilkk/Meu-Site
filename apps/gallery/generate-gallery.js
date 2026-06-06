var fs = require("fs");
var path = require("path");

var dir = path.join(__dirname, "media");
var files = fs.readdirSync(dir)
  .filter(function (f) {
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(f);
  })
  .sort(function (a, b) {
    return a.localeCompare(b, undefined, { numeric: true });
  });

var out = files.map(function (f) { return '    "' + f + '"'; }).join(",\n");
console.log("Copy this into gallery.js _galleryFallback array:\n");
console.log("  var _galleryFallback = [");
console.log(out);
console.log("  ];");
console.log("\n(" + files.length + " files)");
