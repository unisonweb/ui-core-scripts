#!/usr/bin/env node

const {
  elmGitInstall,
  replaceElmGitRepoSha,
  getUICoreOriginFromElmGit,
} = require("./ui-core");

const shaArg = process.argv.slice(2)[0];
const repoArg = process.argv.slice(2)[1];

// if sha & repo -> use both
// if sha only -> default repo & sha
// no args -> get current value

if (shaArg && repoArg) {
  // sha & repo specified -> use both
  console.log("Both repo and sha are specified.");
  console.log({ repo: repoArg, sha: shaArg });

  Promise.resolve({ repo: repoArg, sha: shaArg })
    .then((args) => {
      return replaceElmGitRepoSha(args.repo, args.sha);
    })
    .then(() =>
      elmGitInstall(repoArg.replace("https://", "./elm-stuff/gitdeps/"))
    );
} else if (shaArg) {
  // only sha specified -> default repo & sha
  const repo = "https://github.com/unisonweb/ui-core";

  console.log("Only sha is specified. Using default repo with the sha.");
  console.log({ repo: repo, sha: shaArg });

  Promise.resolve(shaArg)
    .then((sha) => {
      return replaceElmGitRepoSha(repo, sha);
    })
    .then(() =>
      elmGitInstall(repo.replace("https://", "./elm-stuff/gitdeps/"))
    );
} else {
  // no args -> use current value
  getUICoreOriginFromElmGit().then((uiCoreOrigin) => {
    if (!uiCoreOrigin) {
      console.error("No ui-core setting in elm-git.json!");
      return;
    }
    console.log("No args. Values in elm-git.json are used.");
    console.log({ repo: uiCoreOrigin.url, sha: uiCoreOrigin.sha });

    return elmGitInstall(
      uiCoreOrigin.url.replace("https://", "./elm-stuff/gitdeps/")
    );
  });
}
