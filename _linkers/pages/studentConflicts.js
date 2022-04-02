const {pyCall} = require("../_linkers/pyCall.js"); 
const {eventSelectFavorite} = require("../_linkers/common/selectFavorite"); 
const { TimeFrame } = require("../_linkers/utils/TimeFrame.js");
const { ScheduleTable } = require("../_linkers/components/ScheduleTable.js");

let UCCodes 
let toast = new ToastComponent();

// TODO Validate Input

document.querySelector("button[type=submit]").addEventListener("click", (event) => handleQuery(event));

function handleQuery(event) {
    event.preventDefault();
    
    UCCodes = splitInput(document.querySelector("#code").value);

    console.log(UCCodes);

    pyCall("check_student_conflicts", "FN_NAME", [UCCodes]);
}