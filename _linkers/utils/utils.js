const path = require('path');
let clipboard;

// GENERIC TABLE ----------------------------------------------------------------------------------------

function buildTableHead(head){
    let theadElement = document.createElement("thead"); 
    let trElement = document.createElement("tr"); 
    head.forEach(headText => { 
        let tdElement = document.createElement("th");  
        tdElement.innerText = headText; 
        trElement.appendChild(tdElement); 
    });  
    theadElement.appendChild(trElement); 
    return theadElement; 
}

function clearTable(table) {
    let bodies = table.querySelectorAll('tbody');

    for (let body of bodies) {
        body.parentNode.removeChild(body);
    }
}

document.addEventListener("click", function(event) {
    let div = document.getElementById("dropdown-menu");
    if(div == null) return;
    if(!div.contains(event.target)) {
        div.classList.remove('show');
        div.classList.add('none');
    }
});

document.addEventListener("keydown", function(event) {

    let div = document.getElementById("dropdown-menu");
    if(div == null) return;

    let childDiv = div.childNodes;
    let selectedChild = undefined;
    let index = 0;
    for(index = 0; index < childDiv.length; index++) {
        if(childDiv[index].classList.contains("active")) {
            selectedChild = childDiv[index];
            break;
        }
    }

    for(let i = 0; i < childDiv.length; i++) {
        if(i == index) continue;
        childDiv[i].classList.remove("active");
    }

    switch(event.key) {
        case "ArrowDown":
            
            if(selectedChild === undefined) {
                childDiv[0].classList.add("active");
                return;
            } else {
                if(index+1 < childDiv.length) {
                    childDiv[index].classList.remove("active");
                    childDiv[index+1].classList.add("active");
                }
            }
            break;
        case "ArrowUp":
            if(selectedChild === undefined) {
                childDiv[0].classList.add("active");
                return;
            } else {
                if(index-1 >= 0) {
                    childDiv[index-1].classList.add("active");
                    childDiv[index].classList.remove("active");
                }
            }
            break;
        default:
            return;
    }
});


// TABLE FOR SCHEDULES  ----------------------------------------------------------------------------------
function buildTable(data) {
    // table_id
    let table = '<br><br><table id="table_id" class="table table-striped table-bordered" cellspacing="0" >';

    table = buildHead(table, data);
    table = buildBody(table, data);
    table += "</table>";
}



function buildHead(table, data) {
    table += "<thead><tr>";
    table += "<th>#</th>";
    for (let keys of Object.keys(data[Object.keys(data)[0]]))   // keys of the first element of the data dictionary
        if (keys !== 'error') table += "<th>" + keys + "</th>";

    table += "</tr></thead>";
    return table;
}

function buildBody(table, data) {
    table += "<tbody>";
    let counter = 0; 		                                //the counter of the position in the array of values

    for (let key of Object.keys(data)) {
        if (key === 'error') continue;

        table += "<tr>";
        table += "<th>" + counter + "</th>";

        for (let sub_key of Object.keys(data[key])) {
            if (sub_key === 'Link' || sub_key === 'link') table += "<td><a class='link-table' href='" + data[key][sub_key] + "'> link </a></td>";
            else table += "<td>" + data[key][sub_key] + "</td>";
        }
        table += "</tr>";
        counter++;
    }
    table += "</tbody>";
    return table;
}

function clearSelection() {
    if (window.getSelection) window.getSelection().removeAllRanges();
    else if (document.selection) document.selection.empty();
}


function dict_to_csv(data) {
    let text = ""

    // columns name
    let keys = Object.keys(data[Object.keys(data)[0]])
    for (let i = 0; i < keys.length - 1; i++)   // keys of the first element of the data dictionary
        if (keys[i] !== 'error') text += keys[i] + ", ";
    text += keys[keys.length - 1] + "\n";

    //items
    for (let student of Object.keys(data)) {
        if (student === 'error') continue;

        let info_student = Object.keys(data[student]);
        for (let i = 0; i < info_student.length - 1; i++) {
            text += data[student][info_student[i]] + ", ";
        }
        text += data[student][info_student[info_student.length - 1]] + "\n";
    }

    const fs = require('fs');
    fs.writeFile('Output.csv', text, "utf16le", (err) => {
        if (err) messageError(err);
        else messageSuccess("Output.csv criado com sucesso.");
    });
} 


// DATATABLE --------------------------------------------------------------------
/**
 * Updates the datatable without reloading the page. 
 * @param {string} selector - how to select the table. Ex: "#wrapper-table"
 * @param {array} newDataArray  - the new data for the table. Should be an array of arrays.
 */
function updateDataTable(selector, newDataArray){
    let dataTable = $(selector).DataTable(); 
    dataTable.clear();
    dataTable.rows.add(newDataArray); 
    dataTable.draw(); 
}

/**
 * Adds information to the table.
 * @param {string} selector - how to select the table. Ex: "#wrapper-table" 
 * @param {array} newDataArray  - the new data for the table. Should be an array of arrays.
 */
function addRowDataTable(selector, newDataArray){ 
    let dataTable = $(selector).DataTable();  
    dataTable.rows.add(newDataArray); 
    dataTable.draw();
} 


// FILE OPERATIONS  --------------------------------------------------------------  


function readSchedule(){
    const fs = require("fs");
    return fs.readFileSync(path.join(__dirname, "../resources/app/data/schedules.json"), "utf8").trim(); 
}
/**
 * Reads the favorites file depending on the type. 
 * @param {string} type - can be docents, students or ucs 
 * @returns The file content. 
 */
function readFavorites(type) {
    const fs = require("fs");
    return fs.readFileSync(path.join(__dirname, "../resources/app/data/favorites/") + type + ".json", "utf8").trim();
}
  
function saveFavorites(type, content){
    const fs = require("fs"); 
    let jsonContent = JSON.stringify(content); 
    fs.writeFileSync(path.join(__dirname, "../resources/app/data/favorites/") + type + ".json", jsonContent, "utf-8");
    return true;  
} 


// CONVERTIONS ------------------------------------------------------------------- 

// From {{}, {}, ...} to [{}, {}, ...]
function objectToArray(obj){ 
    let arr = [];  
    Object.keys(obj).forEach(key => arr.push(obj[key])) 
    return arr; 
}

// From [{}, {}, ...] To [[], [], ...]
function jsonToArray(json){  
    let finalArr = []
    json.forEach(element => {  
        let temp = [];  
        let keys = Object.keys(element); 
        keys.forEach(key => {
            temp.push(element[key]); 
        });  
        finalArr.push(temp); 
    }); 

    return finalArr;
} 

// DATE OPERATIONS ----------------------------------------------------------------


function stringToDate_yyyymmdd(date){
    let splitedDate = date.split("-");   
    return new Date(splitedDate[0], splitedDate[1]-1, splitedDate[2]); 
} 

function stringToDate_ddmmyyyy(date){
    let splitedDate = date.split("-");   
    return new Date(splitedDate[2], splitedDate[1]-1, splitedDate[0]); 
} 

// FORMATING -----------------------------------------------------------------------
function splitInput(text){
    return text.trim().replace(/;|,/g, ' ').replace(/\s+/g, ' ').split(" ").join(";"); 
}


// INPUT VALIDATION ---------------------------------------------------------------


/**
 * Set an input as invalid.
 * @param {Element} inputElement 
 * @param {String} feedback 
 */
function setInvalidInput(inputElement, feedback){  
    if (inputElement.classList.contains("is-valid")) inputElement.classList.remove("is-valid"); 
    inputElement.classList.add("is-invalid");
    inputElement.nextElementSibling.innerText = feedback; 
}

/**
 * Set an input element as valid. 
 * @param {Element} inputElement 
 */
function setValidInput(inputElement) {
    if (inputElement.classList.contains("is-invalid")) inputElement.classList.remove("is-invalid"); 
    inputElement.classList.add("is-valid");
}

module.exports = {buildTable, clearTable, readFavorites, jsonToArray, objectToArray, stringToDate_ddmmyyyy, stringToDate_yyyymmdd, buildTableHead, splitInput, setInvalidInput, setValidInput};