const {pyCall} = require("../_linkers/pyCall.js");
const {eventSelectFavorite} = require("../_linkers/common/selectFavorite");

// load the favorites
let favoritesDict = jsonToArray(JSON.parse(readFavorites("students")));
let toast = new ToastComponent();  

$('#table-wrapper-favorites').DataTable({
    data: favoritesDict,
    columns: [
        {title: 'Up'},
        {title: 'Tipo'}, 
        {title: 'Nome'} 
    ], 
    "columnDefs": [
        {
            "targets": [ 1 ],
            "visible": false,
            "searchable": false
        },
    ]
})

document.querySelector("button#search").addEventListener("click", handleSearchStd);
eventSelectFavorite();


function validateInput(){
    let studentsElement = document.querySelector("#code"); 
 
    if (studentsElement.value.trim() == ""){  
        setInvalidInput(studentsElement, "Este campo deve ser preenchido."); 
        return false; 
    } 
    setValidInput(studentsElement) ; 
    return true; 
} 

/**
 * Request GET data from python.
 */
function handleSearchStd() { 
    if (!validateInput()) return;
    
    if (getLogged() === "false") {
        toast.show("Não está autenticado", toastColor.RED);
    }
    else {
        const students = document.querySelector("#code").value.trim();
        const courses = document.querySelector("#ucs").value.trim();
        const semesterYear = getCheckBoxValues();
        const media = getCheckBoxMedia();
        const onlyAtrasadas = getCheckBoxAtrasadas();
        toast.show("Carregando...", toastColor.BLUE, false);
        pyCall("search_student", "final_handleSearchStd", [students, courses, semesterYear, media, onlyAtrasadas]);
    }
}

function getCheckBoxValues(){
    const checkBoxes = document.querySelectorAll("input[type=checkbox]");
    let selectedValues = [];
    checkBoxes.forEach((element)=>{
        if (element.checked) selectedValues.push(element.id);
    });

    return selectedValues;
}

function getCheckBoxMedia(){
    const checkBox = document.querySelector("#media")
    return checkBox.checked;
}

function getCheckBoxAtrasadas(){
    const checkBox = document.querySelector("#atrasadas");
    return checkBox.checked;
}

/**
 * Receives message from python request.
 * @param data - Python response
 */
function final_handleSearchStd(data) {
    console.log(data);
    if (data.error === "true") toast.show("Não foi possível processar dados", toastColor.RED);
    else { 
        toast.show("Tabela carregada", toastColor.GREEN);
        buildTableStudent(data['table']);
        window.location.href = "#table-wrapper";
    }
}


/**
 * Uses the python html table response to create the table.
 * @param responseTable - Table offered by python.
 */
function buildTableStudent(responseTable) {
    const parser = new DOMParser();

    let htmlWithTable = parser.parseFromString(responseTable, 'text/html');
    let table = htmlWithTable.querySelector("table");
    setTableAttr(table);
    setHeaderFields(table);
    createTableButtons(table);
    addTableToHtml(table);

    listenCopy();
    listenCSV("Resultado de Pesquisa de Estudante");
}

/**
 * Set classes and id for the table.
 * @param table - Table to be used.
 */
function setTableAttr(table){
    table.classList.add("table");
    table.classList.add("table-striped");
    table.classList.add("table-bordered");
    table.id = "table_id";
}

/**
 * Pandas in python does not generates those fields automatically, so it can cause some in DataTable.
 * @param table - Table to be used.
 */
function setHeaderFields(table){
    let th = table.querySelectorAll('thead th');
    th[0].innerText = "Código";
}

/**
 * Renders the table with the DataTable and adds it to the document.
 * @param table - Table to be rendered.
 */
function addTableToHtml(table){
    let tableWrapper = document.querySelector("#table-wrapper");
    tableWrapper.appendChild(table);
    let hiddenTable = document.createElement("table");
    hiddenTable.innerHTML = table.innerHTML;
    hiddenTable.id = "hidden_table_id";
    hiddenTable.setAttribute("hidden", "true");
    tableWrapper.appendChild(hiddenTable);

    $('#table_id').DataTable({
        'rowsGroup': [0,1],   // allows rowspan.
    });
}
module.exports = {final_handleSearchStd};
