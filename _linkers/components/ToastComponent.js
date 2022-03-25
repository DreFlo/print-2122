/**
 * Possible colors to the toast.
 */
const toastColor = {
    GREEN: ["bg-success", "text-white"],
    RED: ["bg-danger", "text-white"], 
    BLUE: ["bg-primary", "text-white"], 
    YELLOW: ["bg-warning", "text-dark"]
};

/**
 * Class responsible for adding toast to the html and for displaying it. 
 */
class ToastComponent {
    constructor(){
        this.createHtml();
    } 

    /**
     * Adds toast div to the html. 
     */
    createHtml(){
        let body = document.querySelector("body");
        this.toastDiv = document.createElement("div");
        this.toastDiv.id = "toast";  
        this.toastDiv.classList.add("toast");   

        this.toastBody = document.createElement("div");
        this.toastBody.classList.add("toast-body"); 

        this.toastDiv.appendChild(this.toastBody);
        body.appendChild(this.toastDiv);  // Adds the toast to the body element.  
    }  

    /**
     * Removes toast color if any. 
     */
    removeColor(){
        if (this.toastDiv.classList.contains(toastColor.GREEN))
            this.toastDiv.remove(...toastColor.GREEN);  
        if (this.toastDiv.classList.contains(toastColor.RED))
            this.toastDiv.remove(...toastColor.RED);   
        if (this.toastDiv.classList.contains(toastColor.BLUE))
            this.toastDiv.remove(...toastColor.BLUE);  
        if (this.toastDiv.classList.contains(toastColor.YELLOW))
            this.toastDiv.remove(...toastColor.YELLOW);  
    }

    /**
     * Displays the toast according the given configurations. 
     * @param {String} phrase Phrase to show in the toast. 
     * @param {toastColor} color Toast color.  
     * @param {Boolean} autohide True if the toast should autohide. False otherwise.
     */
    show(phrase, color, autohide = true){   
        this.hide();
        this.toastBody.innerText = phrase;  
        this.removeColor();
        this.toastDiv.classList.add(...color); 
        this.toast = new bootstrap.Toast(this.toastDiv, {autohide: autohide}).show(); 
    } 

    hide(){
        if (this.toast != undefined) this.toast.hide();
    }
}

module.exports = {ToastComponent, toastColor};