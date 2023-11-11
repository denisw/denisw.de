module.exports = function ({ eleventy }) {
  return {
    url:
      eleventy.env.runMode === "serve"
        ? "http://localhost:8080"
        : "https://denisw.de",
    twitterUsername: "dwashingtn",
  };
};
