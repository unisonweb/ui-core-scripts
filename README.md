ui-core-scripts
===============

Various helper scripts to install and update
[ui-core](https://github.com/unisonweb/ui-core) (the Unison design system and
adjacent UI libraries) in host applications.

These scripts are meant to be used from the host applications.
Suggest adding them in the host application "scripts" section of package.json like so:

```json
{
  "scripts": {
    "ui-core-check-css": "ui-core-check-css",
    "ui-core-install": "ui-core-install",
    "ui-core-update": "ui-core-update",
    "postinstall": "ui-core-install"
  }
}
```

Community
--------
[Code of conduct](https://www.unisonweb.org/code-of-conduct/)
