/**
 * This class is responsible for building the schedule table. 
 */
class ScheduleTable {    
    /**
     * This class is responsible for building the schedule table. The parameters in the constructor are mandatory in order to build the table.  
     * The table will always be built inside an element inside a class ".sched". 
     * @param {JSON} scheds This should be JSON object, where the keys are the date and the value is an array of schedules. 
     * @param {Function} matrixValue Inside this class the table will have a matrix form. This function will decide what are the values this matrix should store. 
     * This function should receive four inputs: the matrixCell, the hourIndex, startIndexHour and the schedule. 
     * The matrix cell is the current value of the cell in the matrix. In the biggest part of the time it will be undefined. 
     * The hourIndex represents the index of the current hour. It's the line we are in the matrix. 
     * The startIndexHour is the hour the schedule has started. 
     * The schedule is the current class. 
     * @param {Function} buildTd This function will receive the matrixValue as parameter and should return a <td> element.  
     * @example
     * ``` 
     * const matrixValue = (matrixCell, hourIndex, startHourIndex, schedule) => {
     *   if (matrixCell == undefined) matrixCell = []; 
     *   matrixCell.push(schedule);  
     *   return matrixCell; 
     * } 
     * 
     * const buildTd = (data) => { 
     *  let size; 
     *  let tdElement = document.createElement("td");   
     *
     *  if (data == undefined) size = 0;  
     *  else size = data.length;  
     *
     *  if (size == 0) tdElement.classList.add("green"); 
     *  else if (size == docentsNumber) tdElement.classList.add("red");
     *  else tdElement.classList.add("yellow"); 
     *
     *
     *  let divElement =  buildToolTip(docentsNumber - size + "/" + docentsNumber, data);     
     *  tdElement.appendChild(divElement);
     *  return tdElement; 
     * }
     * 
     * constructor({"10-10-2021 to 20-10-2021": [schedules, ...]}, matrixValue, buildTd);  
     */
    constructor(scheds, matrixValue, buildTd){
        this.scheds = scheds;  
        this.buildTd = buildTd; 
        this.matrixSched = this.create2dMatrixSched(matrixValue);  
        
    }

    /**
     * This method is responsible for adding the table to the html. 
     */
    show(){
        this.createButtons(this.scheds);  
        this.buildScheduleTable();  
        this.buttonToggle();
    }

    /**
     * Function that coordinates the table building.
     */
    buildScheduleTable(){
        let sectionElement = document.querySelector(".scheds"); 
        let timeframes = Object.keys(this.scheds);  

        timeframes.forEach(timeframe => {
            let divElement = document.createElement("div"); 

            let hrElement = document.createElement("hr");
            divElement.appendChild(hrElement);
            
            // Adds timeframe as subtitle.
            let h2Element = document.createElement("h2");  
            h2Element.innerText = timeframe;  
            h2Element.classList.add("display-5");
            divElement.appendChild(h2Element);  

            // table
            let table = document.createElement("table"); 
            table.classList.add("table"); 
            table.classList.add("table-striped");  
            
            // table head
            let theadElement = this.buildTableHead();  
            table.appendChild(theadElement); 

            // table body 
            let firstCol = this.getFirstCol(8, 29);  
            let tbodyElement = this.buildTableBody(this.matrixSched[timeframe], firstCol); 

            table.appendChild(tbodyElement); 
            divElement.id = timeframe.replace(" to ", "-"); 
            divElement.classList.add("table-wrapper"); 

            divElement.appendChild(table); 
            sectionElement.appendChild(divElement);
        }); 


    } 

    /**
     * This function builds the table body. It's important to know that if the data is equals 'x' no <td> is generated. Thus the 'x' value is special. 
     * @param {Object} data The matrix cell.
     * @param {Array} firstCol This first col is generaly the week days. 
     * @returns {Element} Returns the tbody element
     */
    buildTableBody(data, firstCol){
        let numRows = data.length; 
        let numCols = data[0].length;  

        let tbodyElement = document.createElement("tbody"); 
        for (let i = 0; i < numRows; i++){  
            let trElement = document.createElement("tr");  
            // Add time. 
            let tdTimeElement = document.createElement("td"); 
            tdTimeElement.innerText = firstCol[i];  
            trElement.appendChild(tdTimeElement); 

            for (let j = 0; j < numCols; j++){     
                if (data[i][j] !== "x"){ 
                    trElement.appendChild(buildTd(data[i][j]));  
                }
            } 
            tbodyElement.appendChild(trElement); 
        } 
        return tbodyElement; 
    } 

    /**
     * Creates the table head. Where the head is the week days.
     * @returns Table head
     */
    buildTableHead(){ 
        let head = ["#", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];   
        let theadElement = document.createElement("thead"); 
        let trElement = document.createElement("tr"); 
        head.forEach(headText => { 
            let tdElement = document.createElement("td");  
            tdElement.innerText = headText; 
            trElement.appendChild(tdElement); 
        });  
        theadElement.appendChild(trElement); 
        return theadElement; 
    }

    /**
     * Transforms the schedule JSON object in matrix. 
     * @param {Function} matrixValue Decides what should be the value of each matrix cell. 
     * @returns {JSON} Each value should be a time frame such as "20-10-2020 to 26-10-2020" and the values are matrixes. 
     */
    create2dMatrixSched(matrixValue){   
        let allMatrixSched = {} 
        Object.keys(this.scheds).forEach(period => {   
            // Generate matrix [29][6] => [hour][day]
            let matrixSched = []; 
            for (let i = 0 ; i < 29; i++) matrixSched.push(new Array(6)); 
            this.scheds[period].forEach(schedule => {
                let startHourIndex = (schedule.start_time - 8) * 2;  
                for (let i = startHourIndex ; i < startHourIndex + schedule.duration * 2 ; i++) {  
                    matrixSched[i][schedule.day] = matrixValue(matrixSched[i][schedule.day], i, startHourIndex, schedule); 
                } 
            });
            
            allMatrixSched[period] = matrixSched; 
        }); 
        return allMatrixSched; 
    }  

    // BUTTONS -------------------------------------------------------------------------------- 
    /**
     * Creates buttons timeframe buttons. 
     * If a button is selected the table associated with the timeframe specified in the button should be shown. 
     * Just one button can be selected at time and likewise just one table should be shown at time. 
     * @param {JSON} schedule The schedule JSON object where each key is a time frame and the values are matrixes.
     */
    createButtons(schedule){ 
        let schedsElement = document.querySelector(".scheds");
        let title = document.createElement("h4");
        title.innerHTML = "Intervalos de Horários:"
        schedsElement.appendChild(title);
        let buttonWrapper = document.createElement("div"); 
        buttonWrapper.id = "weeks"; 
        let keys = Object.keys(schedule);  
        // Ordering the buttons by timeframe in ascending order. 
        keys.sort((a, b) => {
            let d1 = a.split(/-|to/).slice(0,3).map(number => parseInt(number.trim())); 
            let d2 = b.split(/-|to/).slice(0,3).map(number => parseInt(number.trim())); 
            if (d1[2] !== d2[2]) return d1[2] - d2[2]; 
            if (d1[1] !== d2[1]) return d1[1] - d2[1]; 
            return d1[0] - d2[0];
        }); 

        // Creating and adding buttons to the html. 
        keys.forEach(date => {
        let button = document.createElement("button"); 
            button.innerText = date; 
            buttonWrapper.appendChild(button); 
        });  

        schedsElement.appendChild(buttonWrapper);
    } 

    /**
     * Setting action for when one button is toggled/selected. 
     */
    buttonToggle(){ 
        let buttons = document.querySelectorAll("#weeks button");  
        let tables = document.querySelectorAll(".table-wrapper"); 
        this.hideAll(tables);
        buttons.forEach(button => button.addEventListener("click", event => { 
            this.hideAll(tables); 
            let selectedTable = document.getElementById(button.innerText.replace(" to ", "-").trim());   
            selectedTable.style.display = "block";  

            this.disableAllButtons(buttons); 
            button.classList.add("selected"); 
        })); 
    }
    /**
     * Set all buttons in the list as disabled. 
     * @param {Array} buttons List of all timeframe buttons.
     */
    disableAllButtons(buttons){
        buttons.forEach(button => {
            if (button.classList.contains("selected")) button.classList.remove("selected"); 
        }); 
    } 

    /**
     * Hide all elements in the array list.
     * @param {Array} elements Elements to be hided. 
     */
    hideAll(elements){
        elements.forEach(element => { 
            element.style.display = "none"; 
        }); 
    }

    // AUXILIAR ----------------------------------------------------
    /**
     * Generates the first column in the table. 
     * @param {Number} startHour First hour in the table. 
     * @param {Number} numRows Number of rows in the table. 
     * @returns {Array} Array representing the first column in the table. 
     */
    getFirstCol(startHour, numRows){
        let firstCol = [] 
        for (let i = 0; i < numRows; i++) {
            firstCol.push(this.floatToHour(startHour + i/2) + " - " + this.floatToHour(startHour + (i+1)/2)); 
        } 
        return firstCol; 
    } 

    /**
     * A number such as 9,5 will become a string such as 09:30. 
     * Float numbers will be parsed to the ":30" format, while integers will be parsed to the ":00" format.
     * @param {Float} number 
     * @returns {String} Hour format. 
     */
    floatToHour(number){
        if (number % 1 == 0) return number.toString().padStart(2, "0") + ":00"; 
        return parseInt(number).toString().padStart(2, "0") + ":30"; 
    }  


}  

module.exports = {ScheduleTable };