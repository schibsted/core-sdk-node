'use strict';

/**
 * A set of routines for dealing with popup windows
 * @module popup
 */

const SDKError = require('../lib/SDKError');
const { isObject } = require('../lib/validate');

/**
 * Keeps a popup window focused as long as it is not closed
 * @param  {object} popupWindowRef - reference to a popup window
 * @return {void}
 */
function keepPopupFocused(popupWindowRef) {
    SDKError.assert(isObject(popupWindowRef), 'Missing the reference to the popup');
    const intervalId = setInterval(() => {
        if (popupWindowRef.closed) {
            clearInterval(intervalId);
        } else {
            popupWindowRef.focus();
        }
    }, 300);
}

function openPopup(url, windowName = 'Schibsted', width = 360, height = 570) {
    SDKError.assert(isUrl(url), 'Invalid URL for popup');
    var settings = {
        width,
        height,
        top: screen.height ? (screen.height - height) / 2 : 100,
        left: screen.width ? (screen.width - width) / 2 : 100,
        /*
        For accessibility reasons, it is strongly encouraged to set this feature
        always on.
        @see https://developer.mozilla.org/en-US/docs/Web/API/Window/open#Note_on_scrollbars
        */
        scrollbars: 'yes',
        location: 'no',
        directories: 'no',
        status: 'no',
        menubar: 'no',
        toolbar: 'no',
        resizable: 'yes'
    };
    var settingsArr = [];
    Object.keys(settings).forEach(key => settingsArr.push(key + '=' + settings[key]));
    return window.open(url, windowName, settingsArr.join(','));
}

module.exports = { keepPopupFocused, openPopup };
