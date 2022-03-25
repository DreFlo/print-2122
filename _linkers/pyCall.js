const {pyshellCaller} = require("../_linkers/pyshellCaller.js");


/**
 * Function responsible for calling the python script and parse the parameters
 * @param pythonFile - python file to be executed
 * @param handler - javascript function from the file caller to be executed after python script
 * @param argv - arguments to be parsed to the python script
 * @returns {Promise<pyshellCaller>}
 */
async function pyCall(pythonFile, handler, argv){
    let caller = new pyshellCaller(pythonFile + ".py", argv);
    caller.execute(handler);
    return caller;
}


module.exports = {pyCall};
