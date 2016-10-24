#!/usr/bin/env node
/**
 * Script for creating Elastic Beanstalk release packages
 * 
 */
var fs = require('fs'),
    async = require('async'),
    globby = require('globby'),
    zip = require('bestzip');

var argv = require('minimist')(process.argv.slice(2));

var pckg = require('./package.json'),
    zipFilename = pckg.name+'-v'+pckg.version+'.zip';


async.waterfall([
  function(done) {
    /**
     * Make sure the release package doesn't exist just yet
     */
    try {
      fs.accessSync(zipFilename);
      done(new Error('That release package already exists. ('+zipFilename+')'));
    } catch (e) {
      done();
    }
  },
  function(done) {
    /**
     * If dockerimage was set, update Dockerrun.aws.json file with new version number
     */
    if(!argv.dockerimage) { return done(); }
    var filedata = fs.readFileSync('./Dockerrun.aws.json').toString();
    filedata = filedata.replace(new RegExp('('+argv.dockerimage+':)(\\d+.\\d+.\\d+)(")', 'i'), '$1'+pckg.version+'$3'); // Search for imagename and semver version (x.x.x)
    fs.writeFile('./Dockerrun.aws.json', filedata, done);
  },
  function(done) {
    /**
     * Figure out files going to the package
     */
    var files = [];
    files.push('Dockerrun.aws.json');
    files.push('.ebextensions');

    // If no image is defined, use the whole fileset
    if(!argv.dockerimage) {
      files.push('*');
      files.push('!node_modules'); // Ignore node_modules
      files.push('!*.zip'); // Ignore previous release packages
    }

    // Add custom excludes
    if(argv.exclude) {
      files.push(argv.exclude);
    }
    
    // Glob the files
    globby(files)
      .catch(function(err) { done(err); })
      .then(function(paths) { done(null, paths); });
  },
  function(files, done) {
    /**
     * Zip the package
     */
    zip(zipFilename, files, done);
  }

], function(err) {
  if(err) {
    console.error(err.message);
    if(argv['show-error-stack']) {
      console.error(err.stack); // Show error stack
    }
    process.exit(1);
  }

  console.log('Elastic Beanstalk release file created. (%s)', zipFilename);
});
