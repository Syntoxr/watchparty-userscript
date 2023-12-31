const {
  author,
  dependencies,
  repository,
  version,
} = require("../package.json");

module.exports = {
  name: {
    $: "watchparty",
    en: "watchparty",
  },
  namespace: "https://github.com/Syntoxr",
  downloadURL: "https://github.com/Syntoxr/watchparty-userscript/raw/gh-pages/watchparty.prod.user.js",
  supportURL: "https://github.com/Syntoxr/watchparty-userscript",
  version: version,
  author: author,
  source: repository.url,
  // 'license': 'MIT',
  match: ["https://www.netflix.com/watch/*","*://www.example.com/", "*://example.com/*", "file:///home/milan/Downloads/Example%20Domain.html"],
  require: [],
  grant: ["GM.setValue", "GM.getValue"],
  connect: [],
  "run-at": "document-end",
};
