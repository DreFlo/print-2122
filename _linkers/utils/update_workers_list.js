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
    });
    var uploadButton = document.getElementById("uploadSchedules");
    uploadButton.addEventListener('click', function() {
        pyCall("import_schedules", "selected_file", ["open_file"]);
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
    alert("Horários exportados.");
}

function selected_file(data){
    if(data['error'] == "true"){
        alert("Erro:\n" + data['message'])
    }
    else{
        schedulesJSON = JSON.parse(readSchedule());
        confirm_message = "Horários existente:\n";
        if(schedulesJSON['updates']['class_schedules'] == "") 
            confirm_message += "Não existem horários de aulas.\n";
        else 
            confirm_message += "Última atualização de horários de aula: " + schedulesJSON['updates']['class_schedules'] + "\n";

        if(schedulesJSON['updates']['exam_schedules'] == "") 
            confirm_message += "Não existem horários de vigilâncias.\n";
        else 
            confirm_message += "Última atualização de horários de vigilância: " + schedulesJSON['updates']['exam_schedules'] + "\n";

        confirm_message += "\nHorários para importar:\n";
        if(data['class_update'] == "")
            confirm_message += "Não existem horários de aulas.\n";
        else
            confirm_message += "Última atualização de horários de aula: " + data['class_update'] + "\n";
        
        if(data['exam_update'] == "")
            confirm_message += "Não existem horários de vigilâncias.\n";
        else
            confirm_message += "Última atualização de horários de vigilância: " + data['exam_update'] + "\n";
        
        confirm_message += "\n Se quer importar o ficheiro selecionado, clique em 'OK'";
        if(confirm(confirm_message))
            pyCall("import_schedules", "finish_update", [data['file_path']]);
    }
}

function finish_update(){
    alert("Horários importados.")
}