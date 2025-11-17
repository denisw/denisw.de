import rssPlugin from "@11ty/eleventy-plugin-rss";
import syntaxHighlightPlugin from "@11ty/eleventy-plugin-syntaxhighlight";

export default function (eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(rssPlugin);
  eleventyConfig.addPlugin(syntaxHighlightPlugin);

  // Assets
  eleventyConfig.addPassthroughCopy("images/*.jpg");
  eleventyConfig.addPassthroughCopy("images/*.png");
  eleventyConfig.addPassthroughCopy("fonts/*.woff2");
  eleventyConfig.addPassthroughCopy("stylesheets/*.css");

  // Settings
  return {
    dir: {
      input: "content",
      data: "../_data",
      includes: "../_includes",
      output: "_site",
    },
  };
}
