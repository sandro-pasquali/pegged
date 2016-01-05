'use strict';

var redis = require('redis');
var Promise = require('bluebird');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

module.exports = function(opts) {

    opts = opts || {};

    var password = !!opts.password;
    var redisPort = opts.port === void 0 ? 6379 : +opts.port;
    var board = opts.board || 'pegged-leaderboard';
    var maxLengthOfList = opts.maxlength || 10;

    var client = redis.createClient(redisPort);

    if(password) {

        client
            .auth(password)
            .catch(function(err) {
                throw new Error('Cannot authenticate with given password');
            });
    }

    client.on("error", function (err) {
        console.log("Client Error " + err);
    });

    function connect(boardname) {
        return client
            .zcardAsync(boardname)
            .then(function() {
                board = boardname;
            });
    }

    function add(member, amount) {
        return client
            .zincrbyAsync(board, +amount, member);
    }

    function subtract(member, amount) {
        return client
            .zincrbyAsync(board, -amount, member);
    }

    function set(member, score) {
        return client
            .zaddAsync(board, score, member);
    }

    function remove(member) {
        return client
            .zremAsync(board, member);
    }

    function rank(member) {
        return client
            .zrankAsync(board, member)
            .then(function(rank) {
                return Promise.resolve(rank + 1);
            });
    }

    function score(member) {
        return client
            .scoreAsync(board, member);
    }

    function leaders(limit, offset) {

        offset = typeof offset === 'undefined' ? 0 : +offset;
        limit = limit || maxLengthOfList;

        return client
            .zrangeAsync([board, offset, limit, 'WITHSCORES']);
    }

    function info() {

        return client
            .zcardAsync(board)
            .then(function(card) {
                return Promise.resolve({
                    total: card
                });
            });

    }

    return {
        connect : connect,
        add : add,
        subtract : subtract,
        set : set,
        remove : remove,
        rank : rank,
        leaders : leaders,
        score : score,
        info : info
    }
};

