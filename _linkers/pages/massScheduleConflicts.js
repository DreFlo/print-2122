const {pyCall} = require("../_linkers/pyCall.js");
const { TimeFrame } = require("../_linkers/utils/TimeFrame.js");
const { ScheduleTable } = require("../_linkers/components/ScheduleTable.js");

let docentsCode;
let docentsCodeArray;
let docentsNumber; 
let startDate; 
let endDate; 
let toast = new ToastComponent();

document.querySelector("button[type=submit]").addEventListener("click", (event) => handleScheduleTime(event));

// REQUESTING ----------------------------------------------------------------

/**
 * This function handles the action of generating the conflict table. 
 * @param {Event} event 
 * @returns null.
 */
function handleScheduleTime(event){
    event.preventDefault(); 
    //if (!validateInput()) return;  
    document.querySelector(".scheds").innerHTML = "";   

    // Getting the input. 
    docentsCode = splitInput(document.querySelector("#code").value);
    startDate = document.querySelector("#start-date").value.trim(); 
    endDate = document.querySelector("#end-date").value.trim();  
    academicYear = document.querySelector("#academic-year").value.trim(); 

    toast.show("Atualizando horários...", toastColor.BLUE, false);  

    // Request to update teachers information. 
    pyCall("retrieve_schedule", "final_handleScheduleTime", [docentsCode, academicYear]);
}  

/**
 * Function that will be called after the server request.  
 * @param {JSON} data - Answer from the backend. In the context of this function it will only contains if the operations has succeeded or not. 
 */
function final_handleScheduleTime(data){
    if (data.error === "true") { 
        toast.show("Não foi possível processar dados.", toastColor.RED); 
    }
    else {
        console.log(data);
        toast.show("Dados atualizados!", toastColor.GREEN);
        let groupedScheds = groupByDate(); 
        let mergedScheds = mergeDates(groupedScheds);
        console.log("Merged:");
        console.log(mergedScheds);  
        let Table = new ScheduleTable(mergedScheds, matrixValue, buildTd);
        Table.show();
    }
    
}  

// "SCHEDULE COLLISION" ------------------------------------------------------------- 

/**
 * Group the relevant schedules by date. Relevant schedules are those that happens in the same period
 * of the given start date and end date. 
 * @returns {JSON} in the format {date: [shedules...], date2: [schedules...]}
 */
function groupByDate(){ 
    
    let groupedScheds = {}
    let inputTimeFrame = new TimeFrame(stringToDate_yyyymmdd(startDate), stringToDate_yyyymmdd(endDate)); 
    let scheduleJson = JSON.parse(readSchedule());     
    docentsCodeArray = docentsCode.split(";").map(element => element.trim());  
    docentsNumber = docentsCodeArray.length;   

    console.log(docentsCodeArray);
    docentsCodeArray.forEach(id => {
        scheduleJson[id]['class_schedule']['schedule'].forEach(sched => {     
            let currTimeFrame = new TimeFrame(stringToDate_ddmmyyyy(sched.start_date), stringToDate_ddmmyyyy(sched.end_date));  
            if (currTimeFrame.isOverlapping(inputTimeFrame) || inputTimeFrame.isOverlapping(currTimeFrame)) { 
                sched['teacher'] = id; 
                let key = currTimeFrame.toString(); 
                if (groupedScheds.hasOwnProperty(key))  groupedScheds[key].push(sched);
                else groupedScheds[key] = [sched];
            }
        });   
    })      


    return groupedScheds;
}
 
/**
 * Some timeframes may be included inside other timeframes and this should not happen. 
 * This functions generates a group of not overlapping timeframes, trying to maximize the number of divisions.
 * For example, we may have the following timeframes:  
 * ```
 *    t1       t2
 * +-------+-------+
 *         t3 
 * +---------------+
 * ```
 * 
 * Timeframe t3 = t2 + t1, thus the resulting timeframes must be t1 and t2, since they're not overlapping and maximize the number of timeframes.
 * To solve this problem I have used linesweep, inspired in the following problem: https://leetcode.com/problems/maximum-profit-in-job-scheduling/. 
 * This solutions has time complexity O(logn * n)
 * @param {JSON} scheds Array with schedules grouped by date. 
 */
function mergeDates(scheds){

    let chosenDates = selectDates(scheds);
    let chosenDatesDict = Object.keys(scheds).filter(key => chosenDates.includes(key)).reduce((res, key) => (res[key] = scheds[key], res), {});     // filter dictionary. 
    let nonChosenDatesDict = Object.keys(scheds).filter(key => !chosenDates.includes(key)).reduce((res, key) => (res[key] = scheds[key], res), {});
    Object.keys(nonChosenDatesDict).forEach(nonChosen => {  
        let nonChosenDate = nonChosen.split(" to ");  
        //let nonChosenTimeFrame = new TimeFrame(stringToDate_ddmmyyyy(nonChosenDate[0]), stringToDate_ddmmyyyy(nonChosenDate[0]));
        let nonChosenTimeFrame = new TimeFrame(stringToDate_ddmmyyyy(nonChosenDate[0]), stringToDate_ddmmyyyy(nonChosenDate[1]));
        chosenDates.forEach(chosen => {
            let chosenDate = chosen.split(" to ");  
            //let chosenTimeFrame = new TimeFrame(stringToDate_ddmmyyyy(chosenDate[0]), stringToDate_ddmmyyyy(chosenDate[0]));
            let chosenTimeFrame = new TimeFrame(stringToDate_ddmmyyyy(chosenDate[0]), stringToDate_ddmmyyyy(chosenDate[1]));
            if (chosenTimeFrame.isOverlapping(nonChosenTimeFrame) || nonChosenTimeFrame.isOverlapping(chosenTimeFrame)){
                chosenDatesDict[chosen].push(...nonChosenDatesDict[nonChosen]);
            }
        }); 
    }); 
    
    return chosenDatesDict;

}

function selectDates(scheds){
    let keys = Object.keys(scheds);  // "dd-mm-yyyy to dd-mm-yyyy"
    let sortedKeys = []; 
    let START = 1, END = 0, n = keys.length;   

    for (let i = 0; i < n; i++){
        let dates = keys[i].split(" to "); 
        sortedKeys.push([stringToDate_ddmmyyyy(dates[0]), START, i]); 
        sortedKeys.push([stringToDate_ddmmyyyy(dates[1]), END, i]); 
    } 

    sortedKeys.sort((a,b) => {
        if (a[0] == b[0]) return a[1]-b[1]; 
        else return a[0]- b[0];
    }) 

    // The goal is to increase the max cost. 
    let maxCost = 0, index; 
    let profits = new Array(n);  
    let chosenDates = []
    for (let i = 0 ; i < n*2; i++){ 
        index = sortedKeys[i][2]; 
        if (sortedKeys[i][1] == START){
            profits[index] = maxCost + 1; 
        } else {
            if (profits[index] > maxCost) {
                chosenDates.push(keys[index]); 
                maxCost = profits[index]; 
            }
        }
    }  

    return chosenDates;
}

const matrixValue = (matrixCell, hourIndex, startHourIndex, schedule) => {
    if (matrixCell == undefined) matrixCell = []; 
    matrixCell.push(schedule); 
    return matrixCell; 
}

const buildTd = (data) => { 
    let size; 
    let tdElement = document.createElement("td");   

    if (data == undefined) size = 0;  
    else size = data.length;  

    if (size == 0) tdElement.classList.add("green"); 
    else if (size == docentsNumber) tdElement.classList.add("red");
    else tdElement.classList.add("yellow"); 


    let divElement =  buildToolTip(docentsNumber - size + "/" + docentsNumber, data);     
    tdElement.appendChild(divElement);
    return tdElement; 
}

function buildToolTip(text, data){
    let div = document.createElement("div"); 
    if (data === undefined) { div.title = "-"}
    else {  
        data.forEach(sched => {
            div.title += sched.teacher_name + `: { aula: `+ sched.class_name + `, local: ` + sched.location + `} ;
`;  
        }); 
    }
    div.setAttribute("data-bs-toggle", "tooltip"); 
    div.setAttribute("data-bs-html", "true");
    div.innerText = text; 

    return div;
}

module.exports = {final_handleScheduleTime};