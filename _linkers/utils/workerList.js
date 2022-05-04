let selectedWorkers = []
var table;

let schedules_doc = './data/schedules.json'

document.addEventListener("DOMContentLoaded", () => {
    setWorkerListEvent();
});


$(document).ready(function() {
    $('#table-wrapper-workers tbody').on( 'click', 'tr', function () {
        $(this).toggleClass('selected');
        workerCode = $(this)[0].childNodes[0].innerText
        if(selectedWorkers.includes(workerCode)) selectedWorkers.splice(selectedWorkers.indexOf(workerCode), 1);
        else selectedWorkers.push(workerCode);
    } );
    
    $('#saveWorkers').on('click', function () {
        addToInput();
    });

    var checkbox = document.getElementById("selectAllCheckbox");
    checkbox.addEventListener('change', function () {
        var trElements = table.$('tr');
        selectedWorkers = []
        for(var i = 0; i < trElements.length; i++){
            if(checkbox.checked){
                trElements[i].classList.add('selected');
                selectedWorkers.push(trElements[i].childNodes[0].innerText);
            }
            else{
                trElements[i].classList.remove('selected');
            }
            
        }
    });

    schedulesJSON = JSON.parse(readSchedule());
    var lastUpdatedClass = document.getElementById("last-updated-class");
    lastUpdatedClass.innerText = "Último update de horários de aula: " + schedulesJSON['updates']['class_schedules'] + "\n";
    var lastUpdatedExams = document.getElementById("last-updated-exams");
    lastUpdatedExams.innerText = "Último update de horários de vigilância: " + schedulesJSON['updates']['exam_schedules'];

});

function setWorkerListEvent(){
    var workers_list = getWorkers();
    createTable(workers_list);
}

// Array with workers with each element being: [code, name, sigla]
function getWorkers() {
    let fs = require("fs")
    let read = fs.readFileSync(schedules_doc, "utf8").trim()
    let array_read = Object.entries(JSON.parse(read))
    var workers = []

    array_read.forEach(element => {
        if(element[0] != "updates"){
            let info = Object.values(element[1])
            workers.push([element[0], info[0], info[1]]);
        }
    });

    return workers
}

// Creates table with information
function createTable(workersArray) {
    
    table = $("#table-wrapper-workers").DataTable({
        retrieve: true,
        data: workersArray, 
        columns: [ 
            {title: "Código"},
            {title: "Nome"},  
            {title: "Sigla"}, 
            {title: ""}
        ], 
        columnDefs: [{
            "defaultContent": " ",
            "targets": 3,
        }, 
        {
            "targets": -1, 
            "data": null, 
            "defaultContent": '<button type="button" class="btn btn-danger btn-remove">X</button>',
        }
        ]
    });
}

function addToInput(){
    let inputLine = document.getElementById("code");
    inputLine.value = selectedWorkers.join(" ");
}

