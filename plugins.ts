import date, { Options as DateOptions } from "lume/plugins/date.ts";
import prism, { Options as PrismOptions } from "lume/plugins/prism.ts";
import basePath from "lume/plugins/base_path.ts";
import slugifyUrls from "lume/plugins/slugify_urls.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import metas from "lume/plugins/metas.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed, { Options as FeedOptions } from "lume/plugins/feed.ts";
import readingInfo from "lume/plugins/reading_info.ts";
import { merge } from "lume/core/utils/object.ts";
import toc from "https://deno.land/x/lume_markdown_plugins@v0.7.0/toc.ts";
import image from "https://deno.land/x/lume_markdown_plugins@v0.7.0/image.ts";
import { alert } from "npm:@mdit/plugin-alert@0.12.0";
import redirects from "lume/plugins/redirects.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import nav from "lume/plugins/nav.ts";
import robots from "lume/plugins/robots.ts";
import minifyHTML from "lume/plugins/minify_html.ts";
import favicon from "lume/plugins/favicon.ts";

import "lume/types.ts";

export interface Options {
  prism?: Partial<PrismOptions>;
  date?: Partial<DateOptions>;
  feed?: Partial<FeedOptions>;
}

export const defaults: Options = {
  feed: {
    output: ["/feed.xml", "/feed.json"],
    query: "type=post",
    info: {
      title: "=metas.site",
      description: "=metas.description",
      generator: false,
    },
    items: {
      title: "=title",
    },
  },
};

/** Configure the site */
export default function (userOptions?: Options) {
  const options = merge(defaults, userOptions);

  return (site: Lume.Site) => {
    site
      .use(tailwindcss())
      .use(basePath())
      .use(nav())
      .use(toc())
      .use(prism(options.prism))
      .use(readingInfo())
      .use(date(options.date))
      .use(metas())
      .use(image())
      .use(resolveUrls())
      .use(slugifyUrls())
      .use(sitemap())
      .use(feed(options.feed))
      .use(robots({
        rules: [
          {
            userAgent: "*",
            disallow: "/uploads",
          },
          {
              userAgent: "*",
              disallow: "/contact/",
            },
        ],
      }))
      .use(
        redirects({
          output: "netlify",
        })
      )
      .use(minifyHTML())
      .use(favicon({
        input: "/favicon.png",
      }))
      .copy("fonts")
      .copy("uploads")
      .copy("icons")
      .mergeKey("extra_head", "stringArray")
      .preprocess([".md"], (pages) => {
        for (const page of pages) {
          page.data.excerpt ??= (page.data.content as string).split(
            /<!--\s*more\s*-->/i
          )[0];
        }
      })
      .add([".css"]);

    // Alert plugin
    site.hooks.addMarkdownItPlugin(alert);
  };
}
