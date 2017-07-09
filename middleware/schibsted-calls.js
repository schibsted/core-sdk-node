'use strict';

function schibstedCallsMiddleware(req, res, next) {
    res.sent('schibsted call here');
}

module.exports = schibstedCallsMiddleware;
