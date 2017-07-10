'use strict';

/**
 * This file declares configs that are essentially part of how the SDK works and interacts with our
 * backend servers.
 */

const ENDPOINTS = {

    /** Good old SPiD endpoints (Schibsted Payment & Identity) */
    SPiD: {
        LOCAL: 'http://spp.dev',
        DEV: 'https://identity-dev.schibsted.com',
        PRE: 'https://identity-pre.schibsted.com',
        PRO: 'https://login.schibsted.com',
        'PRO.NO': 'https://payment.schibsted.no'
    },

    /** The session cluster (has-session) */
    SESSION_CLUSTER: {
        LOCAL: 'http://session.spp.dev',
        DEV: 'https://session.identity-dev.schibsted.com',
        PRE: 'https://session.identity-pre.schibsted.com',
        PRO: 'https://session.login.schibsted.com',
        'PRO.NO': 'https://session.payment.schibsted.no'
    },

    /** BFF (mostly used for UI) */
    BFF: {
        LOCAL: 'http://spp.dev:4100',
        DEV: 'https://front.identity-dev.schibsted.com'
    }

};

module.exports = { ENDPOINTS };
