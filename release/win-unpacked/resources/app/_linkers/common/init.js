var shell = require('electron').shell;
const {setLogged, getLogged} = require("../_linkers/common/checkLogin");
const { ToastComponent, toastColor } = require("../_linkers/components/ToastComponent.js");  

/**
 * This allows the user to click in links.
 * Since electron has stricted protection rules, this piece of code is necessary to allow the user to click in links and opening the browser. 
 */
$(document).on('click', 'a[href^="http"]', function (event) {
    event.preventDefault();
    shell.openExternal(this.href);
});
