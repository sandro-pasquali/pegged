'use strict';

var board = require('../lib');

var testboard = board({
    name: 'testboard'
})

testboard
    .add('sandro', 101)
    .then(function(res) {

        console.log('sandro:', res)

        return testboard.add('pandro',23);
    })
    .then(function(res) {
        console.log('pandro:', res);

        return testboard.score('sandro');
    })
    .then(function(res) {
        console.log('sandro score:', res);

        return testboard.remove('sandro');
    })
    .then(function(res) {
        console.log('sandro is removed:', res);

        return testboard.info();
    })
    .then(function(res) {
        console.log('info:', res);

        return testboard.add('mary', 8675309);
    })
    .then(function(res) {
        console.log('new/incr member score:', res);

        return testboard.list();
    })
    .then(function(res) {
        console.log('list:', res);

        return testboard.leaders();
    })
    .then(function(res) {
        console.log('leaders:', res);

        return testboard.rank('pandro');
    })
    .then(function(res) {
        console.log('pandro rank A:', res);

        return testboard.set('pandro', 8675310);
    })
    .then(function(res) {
        console.log('pandro score is now:', res);

        return testboard.rank('pandro');
    })
    .then(function(res) {
        console.log('pandro rank B:', res);

        return testboard.zero();
    })
    .then(function(res) {
        console.log('zeroed:', res);

        return testboard.connect('testboard');
    })
    .then(function(res) {

        console.log('Board exists ' + res);

        return testboard.destroy();
    })
    .then(function(res) {
        console.log('testboard destroyed:', res);

        return testboard.connect('noboardhere');
    })
    .catch(function(err) {
        console.log('Err:', err)
    })
    .finally(process.exit);

