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
  version: version,
  author: author,
  source: repository.url,
  // 'license': 'MIT',
  match: ["*://www.example.com/", "*://example.com/*", "file:///home/milan/Downloads/Example%20Domain.html"],
  require: [],
  grant: [],
  connect: [],
  "run-at": "document-end",
};
