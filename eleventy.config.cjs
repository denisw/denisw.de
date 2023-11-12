const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(syntaxHighlight);

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
