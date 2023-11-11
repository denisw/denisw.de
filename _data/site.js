module.exports = ({ eleventy }) => ({
  url:
    process.env.SITE_URL ||
    (eleventy.env.runMode === "serve"
      ? "http://localhost:8080"
      : "https://denisw.de"),
});
