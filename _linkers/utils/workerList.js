let selectedWorkers = []

document.addEventListener("DOMContentLoaded", () => {
    setWorkerListEvent();
    setSelectWorkersEvent();
    setChangeEvent();
});


function setWorkerListEvent(){
    var workers_list = getWorkers();
    createTable(workers_list);
}

function setChangeEvent(){
    let table = document.querySelector("#insertWorkers tr");
    table.onchange = function () { setSelectWorkersEvent(); };
}

function setSelectWorkersEvent(){
    let favoriteElement = document.querySelectorAll("#insertWorkers tr");
    //let favoriteElement = document.getElementById("table-wrapper-workers").rows;
    console.log(favoriteElement);
    for (let i = 1 ; i < favoriteElement.length; i++)
        favoriteElement[i].addEventListener("click", (e)=>{
            let trElement = e.target.parentNode;
            let upNumber = trElement.childNodes[0].innerText;
            toggleSelected(upNumber, trElement);
        });

    let saveButton = document.querySelector("#saveWorkers");
    saveButton.addEventListener("click", addToInput);
}

// Array with workers with each element being: [code, name, sigla]
function getWorkers() {
    let fs = require("fs")
    let read = fs.readFileSync("data/temp_workers.json", "utf8").trim()
    let array_read = Object.entries(JSON.parse(read))
    var workers = []

    array_read.forEach(element => {
        let info = Object.values(element[1])
        workers.push([element[0], info[0], info[1]]);
    });

    return workers
}

// Creates table with information
function createTable(workersArray) {

    $("#table-wrapper-workers").dataTable({
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
        },
        ]
    }); 
}

function addToInput(){
    let inputLine = document.getElementById("code");
    inputLine.value = selectedWorkers.join(" ");
}

function toggleSelected(element, trElement){
    if (selectedWorkers.includes(element)) {
        selectedWorkers.splice(selectedWorkers.indexOf(element), 1);
        trElement.classList.remove("selected");
    }
    else {
        selectedWorkers.push(element);
        trElement.classList.add("selected");
    }
}