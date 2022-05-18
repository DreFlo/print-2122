let selectedWorkers = []
var table;

let schedules_doc = path.join(__dirname, '../data/schedules.json');

document.addEventListener("DOMContentLoaded", () => {
    setWorkerListEvent();
});

/**
 * Adds certain information or event at load time:
 *  - What happens when selecting or deselecting a worker in the table
 *  - What happens when clicking the save button
 *  - What happens when clicking the select all checkbox
 *  - Adding at the end of the table the last time the schedules were updated
 */
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

/**
 * Gets the workers info and uses it to create the table
 */
function setWorkerListEvent(){
    var workers_list = getWorkers();
    createTable(workers_list);
}

/**
 * Reads the file where the workers info is stored and creates an array
 * @returns Array with the info, each element being: [code, name, sigla]
 */
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

/**
 * Creates the data table that displays the workers
 * @param {*} workersArray Arrawy with the workers and their information
 */
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
        order: [[1, 'asc']],
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

/**
 * Adds the workers selected to the input line for use later
 */
function addToInput(){
    let inputLine = document.getElementById("code");
    inputLine.value = selectedWorkers.join(" ");
}

