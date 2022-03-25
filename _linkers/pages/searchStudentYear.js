const {pyCall} = require("../_linkers/pyCall.js");
const {eventSelectFavorite} = require("../_linkers/common/selectFavorite");

// load the favorites
let favoritesDict = jsonToArray(JSON.parse(readFavorites("ucs")));
let toast = new ToastComponent();   

$('#table-wrapper-favorites').DataTable({
    data: favoritesDict,
    columns: [
        {title: 'Código'},
        {title: 'Tipo'}, 
        {title: 'Nome'}, 
        {title: 'Sigla'}, 
    ], 
    "columnDefs": [
        {
            "targets": [ 1 ],
            "visible": false,
            "searchable": false
        },
    ]
});

document.querySelector("button#search").addEventListener("click", handleSearch);
eventSelectFavorite();

function validateInput(){
    const courseElement = document.querySelector("#code");
    const year = getYear();   
    const radioElement = document.querySelector("input[type=radio]")
    let isValid = true;  

    if (courseElement.value.trim() == ""){
        setInvalidInput(courseElement, "Este campo deve ser preenchido"); 
        isValid = false; 
    } else setValidInput(courseElement); 

    return isValid; 
}

function handleSearch() { 
    if (!validateInput()) return;
    const course = document.querySelector("#code").value; 
    const year = getYear();  

    toast.show("Carregando...", toastColor.BLUE, false); 
    pyCall("search_student_year", "finalHandleSearch", [course, year]);
}

function getYear() {
    const radios = document.querySelectorAll("input[type=radio]");
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked)
            return radios[i].getAttribute("id").split("-")[1];
    }
    return "";
}

function finalHandleSearch(response){
    if (response.error === "true") toast.show("Não foi possível processar dados", toastColor.RED);
    else {
        toast.show("Sucesso!", toastColor.GREEN);
        buildTableSearch(response['table']);
        window.location.href = "#table-wrapper";
    }

}

function buildTableSearch(responseTable){
    const parser = new DOMParser();

    let htmlWithTable = parser.parseFromString(responseTable, 'text/html');
    let table = htmlWithTable.querySelector("table");
    setTableAttr(table);

    createTableButtons(table);
    createCopyColButton();

    addTableToHtml(table);

    listenCopyColButton('N.º Estudante');
    listenCopy();
    listenCSV();
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
 * Renders the table with the DataTable and adds it to the document.
 * @param table - Table to be rendered.
 */
function addTableToHtml(table){
    let tableWrapper = document.querySelector("#table-wrapper");
    tableWrapper.appendChild(table);

    $('#table_id').DataTable();
}




