![Schibsted Common Components Logo](cc-logo.png)

[![Build Status](https://travis-ci.org/schibsted/core-sdk-node.svg?branch=master)](https://travis-ci.org/schibsted/core-sdk-node)
[![GitHub issues](https://img.shields.io/github/issues/schibsted/core-sdk-node.svg)](https://github.com/schibsted/core-sdk-node/issues)
[![Version](https://img.shields.io/npm/v/schibsted-core-sdk-node.svg?style=flat-square)](http://npm.im/schibsted-core-sdk-node)
[![Downloads](https://img.shields.io/npm/dm/schibsted-core-sdk-node.svg?style=flat-square)](http://npm-stat.com/charts.html?package=schibsted-core-sdk-node&from=2017-01-01)
[![MIT License](https://img.shields.io/npm/l/schibsted-core-sdk-node.svg?style=flat-square)](http://opensource.org/licenses/MIT)


**NOTE: this is very alpha at the moment and hasn't been tested thoroguly. Use at your own risk.**

# Introduction

This is a SDK for accessing SPiD APIs using Node. It makes REST calls with proper authentication mechanism and returns Promises as a result.

This is the base for the [identity](https://github.com/schibsted/identity-sdk)
and [payment](https://github.com/schibsted/payment-sdk)
SDKs which make it even more fluent to work with SPiD APIs in Node. 

```
+----------------------------+--------------------------+
|   schibsted-identity-sdk   |  schibsted-payment-sdk   |
+----------------------------+--------------------------+
|                schibsted-core-sdk-node                |
+-------------------------------------------------------+
```

There is also a [schibsted-browser-sdk](https://github.com/schibsted/browser-sdk)
that is designed to run in the browser for the most common tasks like authentication, etc.
The `schibsted-identity-sdk` and `schibsted-payment-sdk` are not node-specific and despite using
commonJS, can be used in the browser if their tokens are handled properly.
Essentially the `schibsted-core-sdk-node` is the node-specific layer that the other two SDKs are build on top of. In the future there may be a `schibsted-core-sdk-browser` that serves the same purpose for the browser. That may enable the identity and payment SDKs to run in the browser.


## Install

```
npm i schibsted-core-sdk-node
```

# How to use it

Most endpoints need some sort of authentication. There are 3 classes for that:

* `OpenApi`: for endpoints that don't need any authenticaion (just a few APIs)
* `UserApi`: for endpoints that require Access Token (and Refresh Token). It automatically
refreshes the Access Token when needed. (quite a few endpoints use this authorization mechanism)
* `ServerApi`: for endpoints that are mostly used for server-to-server communication between
client (like Aftonbladet) and SPiD (for identification and payment).

```javascript
const { OpenApi, UserApi, ServerApi } = require('schibsted-core-sdk-node');
const spid = new UserApi('http://spp.dev', accessToken, refreshToken);
spid.post('path/to/endpoint', objectContainingParamsAndTheirValues)
    .then(result => console.log(result))
    .catch(console.error);
```

The endpoints are documented in [techdocs](http://techdocs.spid.no/).

# Documentation

You can generate the documentation locally by clonning the repo and 
running `npm i && npm run docs` in its root.
In the near future the documentation will be served online.

# Support

If you work at Schibsted, join the Slack channel [#spt-identity-web-sdk](https://sch-chat.slack.com/messages/G4QM7A2PQ/)

You are welcome to [create an issue](https://github.com/schibsted/core-sdk-node/issues/new).

# License

[MIT](./LICENCE)
