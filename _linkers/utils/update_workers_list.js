
const { fileURLToPath } = require("url");
const {pyCall} = require("../_linkers/pyCall.js");

let toast = new ToastComponent();
let schedulesPath = "./data/schedules.json"

/**
 * Sets what happens when clicking on the update schedules button
 */
$(document).ready(function() {
    var updateButton = document.getElementById('updateWorkers');
    updateButton.addEventListener('click', function() {
        if(confirm("Esta atualização é demorosa.\nAproximadamente 3 horas para atualização dos 2 tipos de horários.\nSe tem a certeza que quer continuar, clique em 'OK'.")){
            let scheduleType = document.querySelector('#scheduleType').value;
            switch(scheduleType){
                case "classes":
                    pyCall("mass_schedule_conflicts", "finish_update", [true, false]);
                    break;
                case "exams":
                    pyCall("mass_schedule_conflicts", "finish_update", [false, true]);
                    break;
                case "both":
                    pyCall("mass_schedule_conflicts", "finish_update", [true, true]);
                    break;
            }
        }
    });
    var downloadButton = document.getElementById("downloadSchedules");
    downloadButton.addEventListener('click', function() {
        pyCall("export_schedules", "finish_download", []);
        /*let fs = require("fs")
        let read = fs.readFileSync(schedulesPath, "utf8").trim()
        let jsonObject = JSON.parse(read);
        let regularUpdate = getDatefromString(jsonObject['updates']['class_schedules']);
        let examsUpdate = getDatefromString(jsonObject['updates']['exam_schedules']);
        var maxDate;
        if(regularUpdate > examsUpdate) maxDate = regularUpdate;
        else maxDate = examsUpdate;
        let filename = "Schedules_" + maxDate.getDay() + "/" + maxDate.getMonth() + "/" + maxDate.getFullYear() + ".json";
        fileURLToPath
        var element = document.createElement('a');
        element.setAttribute('href', './utils.js');
        element.setAttribute('download', filename);
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);*/
    });
});

/**
 * Returns a Date variable created from the given String
 * @param String date - String with date in format "DD-MM-YYYY" 
 */
function getDatefromString(date){
    console.log(date);
    var elements = date.split("-");
    return new Date(elements[2], elements[1], elements[0]);
}

function finish_update(){
    alert("Atualização completa.");
}

function finish_download(){
    alert("Ficheiro descarregado.");
}