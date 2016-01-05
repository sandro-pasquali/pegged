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
        .zaddAsync(board, +score, member)
        .then(function() {
            return Promise.resolve(+score)
        });
    }

    function remove(member) {
        return client
        .zremAsync(board, member);
    }

    // Return rank of member.
    // Note that this is NOT zero(0) based -- first is (1).
    //
    function rank(member) {
        return client
        .zrevrankAsync(board, member)
        .then(function(rank) {
            return Promise.resolve(rank + 1);
        });
    }

    function score(member) {
        return client
        .zscoreAsync(board, member);
    }

    // Return an array of leaders from highest to lowest.
    // Format is:
    // [ {member:'john', score:10}, {member:'mary', score:5}, {}... ]
    // NOTE: No ASC version of this exists. Use Array.reverse() if you want that.
    //
    // @param [start] {Integer} Index to start at, default 0.
    // @param [end] {Integer}   Index to end at.
    //
    function leaders(start, end) {

        start = typeof start === 'undefined' ? 0 : +start;
        end = end || -1;

        return client
        .zrevrangeAsync([board, start, end, 'WITHSCORES'])
        .then(function(list) {

            return Promise.resolve(list.reduce(function(prev, next, i, orig) {

                if(i%2) {
                    prev.push({
                        member: orig[i-1],
                        score: orig[i]
                    });
                }

                return prev;

            }, []));
        })
    }

    // Return miscellaneous info about the leaderboard.
    //
    function info() {
        return client
        .zcardAsync(board)
        .then(function(card) {
            return Promise.resolve({
                totalMembers: card
            });
        });
    }

    // List all members, sorted by their scores, high to low.
    //
    function list() {
        return client
        .zrevrangeAsync([board, 0, -1]);
    }

    // Permanently delete a leaderboard.
    //
    // To set all member scores to zero(0) see #clear.
    //
    function destroy() {
        return client
        .delAsync(board);
    }

    // Set all members to a zero(0) score.
    // Returns a list off all members nulled.
    //
    // To remove all members, see #empty.
    //
    function zero() {
        return client
        .zrevrangeAsync([board, 0, -1])
        .then(function(list) {

            var multi = client.multi();

            // When we have a list of all members set their scores
            // to zero(0) and return the list of members
            //
            list.forEach(function(mem) {
                multi.zadd(board, 0, mem);
            })

            return multi
            .execAsync()
            .then(function() {
                return Promise.resolve(list);
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
        info : info,
        list : list,
        zero : zero,
        destroy : destroy
    }
};

