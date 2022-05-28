const path = require('path');

/**
 * @file This file is responsible for managing the authentication state of the user in the app. 
 */

/**
 * Checks if the user is already logged. Reads the logged file, which can have "true" or "false" written on that.
 * @returns {String} true or false.
 */
function getLogged(){
    const fs = require('fs');
    return fs.readFileSync(path.join(__dirname, '../../logged'), 'utf-8');
}

/** 
 * Set's the login state of the app. Writes in the logged file if the user is already logged. 
 * @param {Boolean} logged True if the user is logged. False otherwise. 
 */
function setLogged(logged){
    const fs = require('fs');
    fs.writeFileSync(path.join(__dirname, '../../logged'), logged);
}

module.exports = {getLogged, setLogged};
