const fs = require("fs/promises");
const p = require("child_process");
const { Octokit } = require("@octokit/core");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function install(dep) {
  return `npx elm-json install ${dep.name}@${dep.version} --yes`;
}

function npmInstall() {
  return "npm install -C ./elm-stuff/gitdeps/github.com/unisonweb/ui-core";
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
      return Object.keys(uiCore.dependencies).map((name) => {
        // A version range looks like so: "1.0.0 <= v < 2.0.0"
        const versionRange = uiCore.dependencies[name];
        // take the major version
        let version = versionRange.split(".")[0];

        return { name, version };
      });
}

function elmGitInstall() {
  return run("npx elm-git-install")
    .then(() =>
      fs.readFile("./elm-stuff/gitdeps/github.com/unisonweb/ui-core/elm.json")
    )
    .then(JSON.parse)
    .then(elmDeps)
    .then((uiCoreDeps) => {
      return fs.readFile("./elm.json")
        .then(JSON.parse)
        .then(elmDeps)
        .then((appDeps) => {
          return uiCoreDeps.reduce((acc, dep) => {
            if (!elmDeps.some((d => d.name === dep.name && d.version === dep.version))) {
              return acc.concat(dep);
            }
            else {
              return acc;
            }
          }, []);
        });
    })
    .then((deps) => {
      return deps.reduce((p, d) => {
        return p.then(sleep(500))
                .then((_) => run(install(d)));
      }, Promise.resolve());
    })
    .then(() => run(npmInstall()));

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
  elmGitInstall,
  getLatestUICoreSha,
};