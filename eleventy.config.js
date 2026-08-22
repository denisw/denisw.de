import rssPlugin from "@11ty/eleventy-plugin-rss";
import syntaxHighlightPlugin from "@11ty/eleventy-plugin-syntaxhighlight";
import YAML from "yaml";
import markdownIt from "markdown-it";

export const config = {
  dir: {
    input: "content",
    data: "../_data",
    includes: "../_includes",
    output: "_site",
  },
};

export default function (config) {
  // === Plugins

  config.addPlugin(rssPlugin);
  config.addPlugin(syntaxHighlightPlugin);

  // === Assets

  config.addPassthroughCopy("images/*.jpg");
  config.addPassthroughCopy("images/*.png");
  config.addPassthroughCopy("fonts/*.woff2");
  config.addPassthroughCopy("stylesheets/*.css");

  // === Data Files

  config.addDataExtension("yaml", (contents) => {
    return YAML.parse(contents);
  });

  // === Template Filters

  config.addFilter("absolute", function (value) {
    const url = new URL(value, this.ctx.site.url);
    return url.toString();
  });

  config.addFilter("humanDate", function (value) {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  config.addFilter("isoDate", function (value) {
    const date = new Date(value);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  });

  const markdown = markdownIt({ html: true });
  config.addFilter("markdown", function (value) {
    return this.env.filters.safe(markdown.render(value));
  });

  config.addFilter("year", function (value) {
    return new Date(value).getFullYear();
  });
}
