#!/usr/bin/env node

const {
  elmGitInstall,
  replaceElmGitSha,
  replaceElmGitRepoSha,
} = require("./ui-core");

const shaArg = process.argv.slice(2)[0];
const repoArg = process.argv.slice(2)[1];

if (repoArg && shaArg) {
  console.log(`Replace elm-git repo & sha:`);
  console.log({ repo: repoArg, sha: shaArg });
  Promise.resolve({ repo: repoArg, sha: shaArg })
    .then((args) => {
      return replaceElmGitRepoSha(args.repo, args.sha);
    })
    .then(() => elmGitInstall());
} else {
  Promise.resolve(shaArg)
    .then((sha) => {
      if (sha) {
        console.log(`Replace elm-git sha:`);
        console.log({ sha: shaArg });
        return replaceElmGitSha(sha);
      } else {
        return;
      }
    })
    .then(() => elmGitInstall());
}
