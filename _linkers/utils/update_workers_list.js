
const {pyCall} = require("../_linkers/pyCall.js");

let toast = new ToastComponent();

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

});

function finish_update(){
    alert("Atualização completa.");
}