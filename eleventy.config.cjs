const rssPlugin = require("@11ty/eleventy-plugin-rss");
const syntaxHighlightPlugin = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(rssPlugin);
  eleventyConfig.addPlugin(syntaxHighlightPlugin);

  // Assets
  eleventyConfig.addPassthroughCopy("images/*.jpg");
  eleventyConfig.addPassthroughCopy("images/*.png");
  eleventyConfig.addPassthroughCopy("fonts/*.woff2");
  eleventyConfig.addPassthroughCopy("stylesheets/*.css");

  // Redirects
  eleventyConfig.addPassthroughCopy("_redirects");

  // Settings
  return {
    dir: {
      input: "content",
      data: "../_data",
      includes: "../_includes",
      output: "_site",
    },
  };
};
