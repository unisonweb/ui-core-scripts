const fs = require("fs/promises");
const p = require("child_process");
const { Octokit } = require("@octokit/core");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function install(dep) {
  return `npx elm-json install ${dep.name}@${dep.version} --yes`;
}

function npmInstall(
  uiCorePath = "./elm-stuff/gitdeps/github.com/unisonweb/ui-core"
) {
  return `npm install -C ${uiCorePath}`;
}

function replaceElmGitSha(sha) {
  return fs
    .readFile("./elm-git.json")
    .then(JSON.parse)
    .then((json) => {
      return {
        ...json,
        ["git-dependencies"]: {
          ...json["git-dependencies"],
          direct: {
            ...json["git-dependencies"].direct,
            ["https://github.com/unisonweb/ui-core"]: sha,
          },
        },
      };
    })
    .then(JSON.stringify)
    .then((data) => fs.writeFile("./elm-git.json", data));
}

function replaceElmGitRepoSha(repo, sha) {
  return fs
    .readFile("./elm-git.json")
    .then(JSON.parse)
    .then((json) => {
      const direct = json["git-dependencies"].direct;

      // TODO: remove '*/ui-core'
      delete direct["https://github.com/unisonweb/ui-core"]; // remove default ui-core to replace with custom one

      return {
        ...json,
        ["git-dependencies"]: {
          ...json["git-dependencies"],
          direct: {
            ...direct,
            [repo]: sha,
          },
        },
      };
    })
    .then(JSON.stringify)
    .then((data) => fs.writeFile("./elm-git.json", data));
}

function getUICoreOriginFromElmGit() {
  return fs
    .readFile("./elm-git.json")
    .then(JSON.parse)
    .then((json) => {
      const directDict = json["git-dependencies"].direct;
      for (const [key, value] of Object.entries(directDict)) {
        if (key.includes("ui-core")) {
          return {
            url: key,
            sha: value,
          };
        }
      }
      return undefined;
    });
}

function getLatestUICoreSha() {
  const octokit = new Octokit();

  return octokit
    .request("GET /repos/{owner}/{repo}/commits", {
      owner: "unisonweb",
      repo: "ui-core",
      number: 1,
    })
    .then((x) => x.data[0].sha);
}

function elmDeps(elmJsonContents) {
  let deps = elmJsonContents.dependencies;

  if ("direct" in deps) {
    deps = {
      ...deps.direct,
      ...deps.indirect,
    };
  }

  return Object.keys(deps).map((name) => {
    // A version range looks like so: "1.0.0 <= v < 2.0.0"
    const versionRange = deps[name];
    // take the major version
    let version = versionRange.split(".")[0];

    return { name, version };
  });
}

function elmGitInstall(
  uiCorePath = "./elm-stuff/gitdeps/github.com/unisonweb/ui-core"
) {
  return run("npx elm-git-install")
    .then(() => {
      return fs.readFile(`${uiCorePath}/elm.json`);
    })
    .then(JSON.parse)
    .then(elmDeps)
    .then((uiCoreDeps) => {
      console.log(`Found ${uiCoreDeps.length} UI Core dependencies`);
      return fs
        .readFile("./elm.json")
        .then(JSON.parse)
        .then(elmDeps)
        .then((appDeps) => {
          return uiCoreDeps.reduce((acc, dep) => {
            if (!appDeps.some((d) => d.name === dep.name)) {
              return acc.concat(dep);
            } else {
              return acc;
            }
          }, []);
        });
    })
    .then((deps) => {
      console.log(`${deps.length} need to be installed`);
      return deps.reduce((p, d) => {
        return p
          .then((_) => {
            console.log(`Installing ${d.name}@${d.version}`);
            return run(install(d));
          })
          .then(sleep(250));
      }, Promise.resolve());
    })
    .then(() => run(npmInstall(uiCorePath)));

  function run(cmd) {
    return new Promise((resolve, _reject) => {
      p.exec(cmd, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
        if (error) {
          console.warn(error);
        } else if (stdout) {
          console.log(stdout);
        } else {
          console.log(stderr);
        }
        resolve(stdout ? true : false);
      });
    });
  }
}

module.exports = {
  install,
  elmGitInstall,
  replaceElmGitSha,
  replaceElmGitRepoSha,
  elmGitInstall,
  getLatestUICoreSha,
  getUICoreOriginFromElmGit,
};
