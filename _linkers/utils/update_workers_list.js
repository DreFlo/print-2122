const {pyCall} = require("../_linkers/pyCall.js");

let toast = new ToastComponent();
var docentsCodeArray;
var index = 0;
var year;
var regular;
var exams;
var updateModal;
var updateInfo;
var closeModalInfo

/**
 * Sets what happens when clicking on the update schedules button
 */
$(document).ready(function() {
    updateModal = document.getElementById("updateInfoModal");
    updateModal.style.display = "none";
    updateInfo = document.getElementById("numberUpdated");
    closeModalInfo = document.getElementById("closeInfoModal");
    closeModalInfo.style.display = "none";
    closeModalInfo.addEventListener('click', function() {
        updateModal.style.display = "none";
    });

    var updateAllButton = document.getElementById('updateAllWorkers');
    updateAllButton.addEventListener('click', function() {
        if(checkInputAll()){
            academicYearElement = document.querySelector("#academic-year-all");
            year = academicYearElement.value.trim();
            if(confirm("Esta atualização é demorosa.\n" + 
                "Aproximadamente 3 horas para atualização dos 2 tipos de horários.\n" + 
                "Se tem a certeza que quer continuar, clique em 'OK'."))
                {
                let scheduleType = document.querySelector('#scheduleTypeAll').value;
                switch(scheduleType){
                    case "classes":
                        regular = true;
                        exams = false;
                        break;
                    case "exams":
                        regular = false;
                        exams = true;
                        break;
                    case "both":
                        regular = true;
                        exams = true;
                        break;
                }
                updateInfo.innerText = "A obter lista de docentes do DEI.";
                updateModal.style.display = "block";
                pyCall("get_dei_docents_list", "getListAndUpdate", []);
            }
        }
    });
        
    var updateSpecificButton = document.getElementById('updateSpecificWorkers');
    updateSpecificButton.addEventListener('click', function() {
        if(checkInputSpecific()){
            academicYearElement = document.querySelector("#academic-year-specific");
            year = academicYearElement.value.trim();
            if(confirm("Esta atualização é demorosa.\n" + 
                "Dependendo do número de docentes que selecionou, pode demorar até 3 horas.\n" +
                "Se tem a certeza que quer continuar, clique em 'OK'."))
                {
                docentsCode = splitInput(document.querySelector("#code").value);
                docentsCodeArray = docentsCode.split(";").map(element => element.trim());
                console.log(docentsCodeArray);
                let scheduleType = document.querySelector('#scheduleType').value;
                switch(scheduleType){
                    case "classes":
                        regular = true;
                        exams = false;
                        break;
                    case "exams":
                        regular = false;
                        exams = true;
                        break;
                    case "both":
                        regular = true;
                        exams = true;
                        break;
                }
                updateModal.style.display = "block";
                updateSchedules();
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

function getListAndUpdate(data){
    if(data['error'] == true){
        alert("Erro a obter lista de docentes DEI.");
    }
    else{
        var data_list = data['list'];
        docentsCodeArray = [];
        for(var i = 0; i < data_list.length; i++) docentsCodeArray.push(data_list[i]);
        updateSchedules();
    }
}

function updateSchedules(data = null){
    if(data != null){
        if(data['error'] == "true"){
            alert("Erro a atualizar horário do docente com código: " + data['worker'] + ".");
            return;
        }
    }
    updateInfo.innerText = "Número de horários atualizados:\n" + index + "/" + docentsCodeArray.length;

    if(index >= docentsCodeArray.length){
        updateInfo.innerText += "\nAtualização completa!";
        closeModalInfo.style.display = "block";
    }
    else{
        pyCall("mass_schedule_conflicts", "updateSchedules", [regular, exams, year, docentsCodeArray[index++]]);
    }
}

/**
 * Returns a Date variable created from the given String
 * @param {String} date - String with date in format "DD-MM-YYYY" 
 */
function getDatefromString(date){
    console.log(date);
    var elements = date.split("-");
    return new Date(elements[2], elements[1], elements[0]);
}

/**
 * Checks if logged in and if there's something in the 'year' field
 */
function checkInputAll(){
    if (getLogged() === "false") {
        toast.show("Não está autenticado", toastColor.RED);
        return false;
    }
    
    academicYearElement = document.querySelector("#academic-year-all");
    if (academicYearElement.value.trim() == "") {
        toast.show("Ano académico tem de ser preenchido", toastColor.RED);
        return false;
    }

    return true;
}

/**
 * Checks if logged, if there are workers selected and if there's something in the 'year' field
 */
function checkInputSpecific(){
    if (getLogged() === "false") {
        toast.show("Não está autenticado", toastColor.RED);
        return false;
    }

    docentsCodeElement = document.querySelector("#code");
    if (docentsCodeElement.value.trim() == ""){
        toast.show("Tem de escolher pelo menos um docente.", toastColor.RED); 
        return false;
    }

    academicYearElement = document.querySelector("#academic-year-specific");
    if (academicYearElement.value.trim() == "") {
        toast.show("Ano académico tem de ser preenchido", toastColor.RED);
        return false;
    }

    return true; 
    
}

function finish_update(){
    updateInfo.innerText = docentsCodeArray.length + "/" + docentsCodeArray.length;
    alert("Atualização completa.");
}

function finish_download(){
    alert("Horários exportados.");
}

/**
 * After selecting a file, the function gives the user the information about the file they were trying to import and the one already on the app
 * @param data json that comes from pyCall 
 */
function selected_file(data){
    if(data['error'] == "true"){
        alert("Erro:\n" + data['message']);
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