import rssPlugin from "@11ty/eleventy-plugin-rss";
import syntaxHighlightPlugin from "@11ty/eleventy-plugin-syntaxhighlight";
import YAML from "yaml";
import markdownIt from "markdown-it";

export default function (eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(rssPlugin);
  eleventyConfig.addPlugin(syntaxHighlightPlugin);

  // Assets
  eleventyConfig.addPassthroughCopy("images/*.jpg");
  eleventyConfig.addPassthroughCopy("images/*.png");
  eleventyConfig.addPassthroughCopy("fonts/*.woff2");
  eleventyConfig.addPassthroughCopy("stylesheets/*.css");

  // Data Files
  eleventyConfig.addDataExtension("yaml", (contents) => YAML.parse(contents));

  // Template Filters
  const markdown = markdownIt({ html: true });
  eleventyConfig.addFilter("markdown", function (value) {
    return this.env.filters.safe(markdown.render(value));
  });

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
