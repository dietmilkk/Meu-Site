var fs = require("fs");
var path = require("path");

var dir = path.join(__dirname, "..", "assets", "gallery");
var files = fs.readdirSync(dir)
  .filter(function (f) {
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(f);
  })
  .sort(function (a, b) {
    return a.localeCompare(b, undefined, { numeric: true });
  });

fs.writeFileSync(path.join(dir, "gallery.json"), JSON.stringify(files, null, 2));
fs.writeFileSync(path.join(dir, "gallery.js"), "window._galleryData = " + JSON.stringify(files, null, 2) + ";\n");
console.log("gallery.json + gallery.js generated with " + files.length + " files");
