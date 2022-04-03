const {pyCall} = require("../_linkers/pyCall.js"); 
const {eventSelectFavorite} = require("../_linkers/common/selectFavorite"); 
const { TimeFrame } = require("../_linkers/utils/TimeFrame.js");
const { ScheduleTable } = require("../_linkers/components/ScheduleTable.js");

let UCCodes 
let toast = new ToastComponent();

// TODO Validate Input

document.querySelector("button[type=submit]").addEventListener("click", (event) => makeQuery(event));

function makeQuery(event) {
    event.preventDefault();
    
    UCCodes = splitInput(document.querySelector("#code").value);

    pyCall("check_student_conflicts", "handleResponse", [UCCodes]);
}

function handleResponse(data) {
    table = document.createElement('table');

    for(let i = 0; i < data['tables'].length; i++) {
        temp = document.createElement('tr')
        temp.innerHTML = data['tables'][i]
        table.appendChild(temp)
    }

    document.body.appendChild(table);
}