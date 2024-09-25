import lume from "lume/mod.ts";
import plugins from "./plugins.ts";

const site = lume({
  src: "./src",
  location: new URL("https://quozul.dev/"),
});

site.use(plugins());

export default site;
