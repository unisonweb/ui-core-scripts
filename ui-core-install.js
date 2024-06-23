#!/usr/bin/env node

const {
  elmGitInstall,
  replaceElmGitSha,
  replaceElmGitRepoSha,
  getUICoreOriginFromElmGit,
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
    .then(() =>
      elmGitInstall(repoArg.replace("https://", "./elm-stuff/gitdeps/"))
    );
} else {
  getUICoreOriginFromElmGit()
    .then((uiCoreOrigin) => {
      if (!uiCoreOrigin) {
        console.error("No ui-core setting in elm-git.json!");
        return;
      }
      if (shaArg) {
        console.log(`Replace elm-git sha:`);
        console.log({ sha: shaArg });
        return replaceElmGitRepoSha(uiCoreOrigin.url, shaArg).then(
          () => uiCoreOrigin
        );
      } else {
        return Promise.resolve(uiCoreOrigin);
      }
    })
    .then((uiCoreOrigin) => {
      if (!uiCoreOrigin) {
        console.error("No ui-core setting in elm-git.json!");
        return;
      }
      return elmGitInstall(
        uiCoreOrigin.url.replace("https://", "./elm-stuff/gitdeps/")
      );
    });
}
