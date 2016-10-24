elasticbeanstalk-package
=============================

Script for creating Elastic Beanstalk release packages. Uses the `package.json` version number for package naming & Docker image versions.


Installation
-----------------------------

```js
npm install elasticbeanstalk-package --save-dev
```

CLI Commands
-----------------------------

Run the script in project root directory either manually or as [npm script](https://docs.npmjs.com/misc/scripts) (fe. `postversion` hook)

```js
elasticbeanstalk-package
```

```js
elasticbeanstalk-package --dockerimage=example-image
```
