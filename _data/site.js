export default ({ eleventy }) => ({
  url:
    process.env.SITE_URL ||
    (eleventy.env.runMode === "serve"
      ? "http://localhost:8080"
      : "https://www.denisw.de"),
  date: new Date(),
});
