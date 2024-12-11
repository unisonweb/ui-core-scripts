#!/usr/bin/env node

const {
  getLatestUICoreSha,
  elmGitInstall,
  replaceElmGitRepoSha,
} = require("./ui-core");

getLatestUICoreSha()
  .then((sha) => {
    return replaceElmGitRepoSha("https://github.com/unisonweb/ui-core", sha);
  })
  .then(() => elmGitInstall());
