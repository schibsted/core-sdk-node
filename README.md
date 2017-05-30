[![Build Status](https://travis-ci.org/userpixel/schibsted-core-sdk-node.svg?branch=master)](https://travis-ci.org/userpixel/schibsted-core-sdk-node)
[![GitHub issues](https://img.shields.io/github/issues/userpixel/schibsted-core-sdk-node.svg)](https://github.com/userpixel/schibsted-core-sdk-node/issues)
[![Version](https://img.shields.io/npm/v/schibsted-core-sdk-node.svg?style=flat-square)](http://npm.im/schibsted-core-sdk-node)
[![Downloads](https://img.shields.io/npm/dm/schibsted-core-sdk-node.svg?style=flat-square)](http://npm-stat.com/charts.html?package=schibsted-core-sdk-node&from=2017-01-01)
[![MIT License](https://img.shields.io/npm/l/callifexists.svg?style=flat-square)](http://opensource.org/licenses/MIT)

# Introduction

**NOTE: this is very alpha at the moment and hasn't been tested thoroguly. If you use it and find it
interesting, please discuss in [#spt-identity-web-sdk](https://sch-chat.slack.com/messages/G4QM7A2PQ/)
or make issues and PRs to the [repo](https://github.schibsted.io/spt-identity/identity-web-sdk-node/).**

This is a SDK for accessing Identity APIs. Currently it supports all the endpoints that are
documented in http://techdocs.spid.no/ for identity and payment.
It is comprised of a Node SDK and a browser SDK.

# How to use it

Due to its alpha stage, the package is not on public NPM. You have a few ways to use it:

1. Put `"identity-web-sdk-node": "git+ssh://git@github.schibsted.io/spt-identity/identity-web-sdk-node.git",`
in your `package.json:dependencies`, install it (`npm install`) and `require('identity-web-sdk-node');`
2. Fork it, install deps (`npm install`) and directly and `require('path/to/identity-web-sdk-node');`
3. Fork it, install deps (`npm install`) then link it: in the root of this repo do `npm link` and
   in the root of your repo do `npm link identity-web-sdk-node`. 

Most SPiD APIs need some sort of authentication. There are 3 classes for that. The reason for using
classes is because they keep the state and only work on those states. the rest of the SDK follows FP
patterns.

* `OpenApi`: allows calling endpoints that don't need any authenticaion (just a few APIs)
* `UserApi`: allows calling endpoints that require Access Token (and Refresh Token). It automatically
refreshes the Access Token when needed. (quite a few endpoints use this authorization mechanism)
* `ServerApi`: allows calling APIs that are mostly used for server-to-server communication between
client (like Aftonbladet) and SPiD (for identification and payment).

```javascript
const { OpenApi, UserApi, ServerApi } = require('path/to/identity-web-sdk-node');
```

All these `XXXXApi` classes above provide `post()`, `get()` and `delete()` function that abstracts the
relevant HTTP verb. See documentation for more info.

```javascript
const fetch = require('node-fetch');
const spid = new UserApi(fetch, 'http://spp.dev', accessToken, refreshToken);
spid.post('path/to/endpoint', objectContainingParamsAndTheirValues);
```

This returns a promise.

Many endpoints are already wrapped in node functions (see the `lib/api` directory and also the
documentation).

For example:

```javascript
// Instead of
spid.post(`/user/${userId}/agreements/accept`, {userId});
// You can write
const sdk = require('identity-web-sdk-node');
sdk.agreement.accept(spid, api, userId);
```

# Documentation

You can see [the HTML documentation](https://pages.github.schibsted.io/spt-identity/identity-web-sdk-node/)
in the `/doc` folder (generate it using `npm run docs`).
