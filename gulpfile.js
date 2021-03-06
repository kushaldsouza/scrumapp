// include gulp
var gulp = require('gulp');

// include plug-ins
var jshint = require('gulp-jshint')
  , nodemon = require('gulp-nodemon')
  , install = require('gulp-install')
  , del = require('del')
  , mocha = require('gulp-mocha')
  , child_process = require('child_process')
  , runSequence = require('run-sequence')
  , postMortem = require('gulp-postmortem');

// JS hint task
gulp.task('jshint', function() {
  gulp.src(['**/*.js', '!node_modules/**/'])
    .pipe(jshint({laxcomma: true}))
    .pipe(jshint.reporter('default'));
});

// Task to install required dependencies
gulp.task('install', function() {
  gulp.src(['./bower.json', './package.json'])
    .pipe(install());
});

// Task to clean the node modules folder
gulp.task('clean', function() {
  del(['node_modules']).then(function (paths) {
     console.log('Deleted files/folders:\n', paths.join('\n'));
  });
});

// Start the database server
gulp.task('startdb', function() {
  child_process.exec('mongod --fork --logpath ./data/dblog.log --nojournal', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    return stdout;
  });
});

// Stop the database server
gulp.task('stopdb', function(callback) {
  child_process.exec('mongo --eval "db.getSiblingDB(\'admin\').shutdownServer()"', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    return stdout;
  });
});

// Start server using nodemon
gulp.task('startserver', function () {
  nodemon({
      script: 'bin/www'
    , ext: 'js'
    , env: { 'NODE_ENV': 'development' }
  });
});

// Main task to start database and server
gulp.task('start', function(callback) {
  runSequence('startdb', 'startserver', callback);
});

// Task to run tests on index route
gulp.task('testindex', function() {
  // Run test
  return gulp.src('./tests/index.js', {read: false})
  .pipe(mocha({reporter: 'list'}))
  .on('error', function(err) {
    console.log(err.toString());
    this.emit('end');
  });
});

// Task to run tests on users route
gulp.task('testusers', function() {
  // Run test
  return gulp.src('./tests/users.js', {read: false})
  .pipe(mocha({reporter: 'list'}))
  .on('error', function(err) {
    console.log(err.toString());
    this.emit('end');
  });
});

// Task to run tests on boards route
gulp.task('testboards', function() {
  // Run test
  return gulp.src('./tests/boards.js', {read: false})
  .pipe(mocha({reporter: 'list'}))
  .on('error', function(err) {
    console.log(err.toString());
    this.emit('end');
  });
});

// Task to run start db server, run test and then shutdown db
gulp.task('test', function(callback) {
  runSequence('startdb', 'seedusers', 'seedboards', 'testindex', 'testusers', 'testboards', 'stopdb', callback);
});

// Task to seed users into database
gulp.task('seedusers', function() {
  // Seed users
  child_process.exec('mongoimport --db scrumapi --collection users --file ./tests/db/users.json --jsonArray --host 127.0.0.1 --drop', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    return stdout;
  });
});

// Task to seed boards into database
gulp.task('seedboards', function() {
  // Seed users
  child_process.exec('mongoimport --db scrumapi --collection boards --file ./tests/db/boards.json --jsonArray --host 127.0.0.1 --drop', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    return stdout;
  });
});

// Task to delete all test data
gulp.task('removedata', function() {
  // Remove data
  // Seed users
  child_process.exec('mongo scrumapi --eval "db.users.remove({});db.boards.remove({})"', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    return stdout;
  });
});

// Task to clear seed data from the db
gulp.task('cleardb', function() {
  child_process.exec('mongo scrumapi --eval "db.users.remove({})"', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
  });
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['start']);
