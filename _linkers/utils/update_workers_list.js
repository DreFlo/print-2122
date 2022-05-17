
const {pyCall} = require("../_linkers/pyCall.js");

let toast = new ToastComponent();

$(document).ready(function() {

    var updateButton = document.getElementById('updateWorkers');
    updateButton.addEventListener('click', function() {
        if(confirm("Esta atualização é demorosa. Aproximadamente 3 horas para atualização dos 2 horários.\nSe tem a certeza que quer continuar, clique em 'OK'.")){
            console.log(new Date());
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