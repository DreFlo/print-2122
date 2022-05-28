/**
 *  Class responsible to read the json done by python and also execute the function after executing python script
 */
class ReadJson{
    constructor(content){
        this.content = content; 
        this.parseJsonInfo(); 
    }

    parseJsonInfo(){
        console.log(this.content);
        this.data = JSON.parse(this.content); 
        this.keys = Object.keys(this.data); 
        this.values = Object.values(this.data); 
    }

    /**
     * Executes the finalFunction
     * @param {string} finalFunction - Name of the function to be executed
     */
    execute(finalFunction){
        console.log(this.data);
        window[finalFunction](this.data);
    }

}


module.exports = {ReadJson };
