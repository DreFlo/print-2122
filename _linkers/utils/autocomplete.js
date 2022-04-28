var deburr = require('lodash.deburr');

function autocomplete(value, arr) {
    let ret = []

    for (let i = 0; i < arr.length; i++) {
        if (deburr(arr[i]).toUpperCase().includes(deburr(value).toUpperCase())) {
            ret.push(arr[i]);
        }
    }

    return ret;
}

module.exports = {autocomplete};