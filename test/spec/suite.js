"use strict";

var path = require('path');
var _ = require('lodash');
var board = require('../../lib');

module.exports = function(test, Promise) {

    var testboard = board({
        name: 'testboard'
    });

    test.ok(_.isPlainObject(testboard), 'Successfully created testboard');

    return testboard
    .add('jack', 101)
    .then(function(res) {

        test.equal(101, +res, 'Sucessfully added `jack` with score');

        return testboard.add('dianne',23);
    })
    .then(function(res) {

        test.equal(23, +res, 'Successfully added `dianne` with score');

        return testboard.score('jack');
    })
    .then(function(res) {

        test.equal(101, +res, 'Sucessfully fetched `jack` score');

        return testboard.remove('jack');
    })
    .then(function(res) {

        test.equal(1, +res, 'Successfully removed `jack`');

        return testboard.info();
    })
    .then(function(res) {

        test.ok(_.isPlainObject(res) && res.totalMembers === 1, 'Retrieving correct board #info');

        return testboard.add('mary', 8675309);
    })
    .then(function(res) {

        test.equal(8675309, +res, 'Successfully added `mary`');

        return testboard.list();
    })
    .then(function(res) {

        test.ok(_.isArray(res), 'Correctly retrieved member array');
        test.deepLooseEqual(['mary', 'dianne'], res, 'Right members in array')

        return testboard.leaders();
    })
    .then(function(res) {

        test.deepLooseEqual(['mary', 'dianne'], _.map(res, _.property('member')), 'Leaders returned in right order');

        return testboard.rank('dianne');
    })
    .then(function(res) {
        
        test.equal(2, +res, 'Received right rank for `dianne`')

        return testboard.set('dianne', 8675310);
    })
    .then(function(res) {

        test.equal(8675310, +res, 'Correctly updated score for `dianne`');

        return testboard.rank('dianne');
    })
    .then(function(res) {

        test.equal(1, +res, 'Correctly moved `dianne` up in rank after new score');

        return testboard.zero().then(function(res) {

            test.ok(_.isArray(res), '#zero returned array as result')

            return testboard.leaders();
        });
    })
    .then(function(res) {

        test.deepLooseEqual([0, 0], _.map(res, _.property('score')), '#zero correctly zeroed scores');

        return testboard.use('testboard');
    })
    .then(function(res) {

        test.equal('testboard', res, '#use is working correctly and returning board name');

        return testboard.destroy();
    })
    .then(function(res) {

        test.ok(+res === 1, 'testboard #destroy successful');

        return testboard.use('testboard');
    })
    .then(function(res) {

        test.fail('Should not get successful #use on testboard');
    })
    .catch(function(err) {

        test.pass('Correctly unable to #use testboard');
    })
};
