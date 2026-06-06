const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  const dir = path.join(process.cwd(), "assets", "gallery");
  try {
    const files = fs.readdirSync(dir)
      .filter(function (f) {
        return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(f);
      })
      .sort(function (a, b) {
        return a.localeCompare(b, undefined, { numeric: true });
      });
    res.setHeader("Cache-Control", "no-cache");
    res.json(files);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
