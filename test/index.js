'use strict';

var board = require('../lib');

var testboard = board({
    name: 'testboard'
})

testboard
    .subtract('sandro', 101)
    .then(function(res) {
        console.log('sandro:', res)
    })
    .catch(function(err) {
        console.log('Err:', err)
    })