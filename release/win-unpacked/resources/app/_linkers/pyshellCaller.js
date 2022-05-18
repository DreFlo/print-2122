const {ReadJson} = require('../_linkers/handle_json.js');
const {PythonShell} = require("python-shell");
const {setLogged, getLogged} = require("../_linkers/common/checkLogin");
const path = require("path");


/**
 * Class responsible for creating and executing python script
 */
class pyshellCaller{
    constructor(filename, argv){
        this.filename = filename; 
        this.argv = argv;
        this.getOptions();
    }

    getOptions(){
        this.options = {
            pythonPath: path.join(__dirname, '../webdev/python'),
            scriptPath: path.join(__dirname, '../_engine/'),
            args: this.argv
        };
    }

    // execute python function and the javascript return function 
    execute(finalFunction){ 
        let pyShell = new PythonShell(this.filename, this.options);
        let jsonObject;

        pyShell.on('message', function(jsonFile){
            jsonObject = new ReadJson(jsonFile);
        });

        pyShell.end(function (err) {
            if (err) {
                toast.show("Erro!", toastColor.RED);
                throw err;
            }
            try {
                jsonObject.execute(finalFunction);
            }catch(e){ 
                console.log(e);
                toast.show("Erro!", toastColor.RED);
            }

        });
        return false;

    }

    /**
     * Function called just in the beginning of the program to cgeck if the person is already logged
     * @returns {Promise<boolean>}
     */
    async check_login(){

        let pyShell = new PythonShell(this.filename, this.options);
        let jsonObject;

        pyShell.on('message', function(jsonFile){
            jsonObject = new ReadJson(jsonFile);
        });

        pyShell.end(function (err) {
            if (err) {
                setLogged('undefined');
                console.log("ERROR");
                return false;
            }
            if (jsonObject.data['Name'] === "NONE") setLogged('false');
            else setLogged('true');
            console.log(getLogged());
        });
        return false;
        
    }

}

module.exports = {pyshellCaller};
