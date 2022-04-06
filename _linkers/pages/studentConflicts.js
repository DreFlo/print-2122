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
    document.querySelector("#studentTables").remove()
    table = document.createElement('table');
    table.id = "studentTables"

    for(let i = 0; i < data['conflict'].length; i++) {
        temp = document.createElement('tr')
        temp.innerHTML = data['conflict'][i]
        table.appendChild(temp)
    }

    document.body.appendChild(table);
}