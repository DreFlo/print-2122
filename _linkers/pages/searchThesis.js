const {eventSelectFavorite} = require("../_linkers/common/selectFavorite");
const {pyCall} = require("../_linkers/pyCall.js"); 


let favoritesDict = jsonToArray(JSON.parse(readFavorites("docents")))
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
eventSelectFavorite();
document.querySelector("button#search").addEventListener("click", handleThesis);


function validateInput(){
    let codeElement = document.querySelector("#code"); 
 
    if (codeElement.value.trim() == ""){  
        setInvalidInput(codeElement, "Este campo deve ser preenchido."); 
        return false; 
    } 
    setValidInput(codeElement) ; 
    return true; 
} 

/**
 * Gets input from user and sends the request python backend.
 */
function handleThesis() { 
    if (!validateInput()) return; 
    let code = document.getElementById("code").value.trim();
    toast.show("Carregando...", toastColor.BLUE, false);
    pyCall("search_teacher_theses", "final_handleThesesStd", [code]);
}

function final_handleThesesStd(response) { 
    toast.hide();
    if (response.error === "true") {
        toast.show("Não foi possível localizar docente.", toastColor.RED);
    } else {
        toast.show("Sucesso!", toastColor.GREEN);
        document.getElementById("professor-name").innerHTML =
            "<h1 class='display-6'>Professor " + response["Name"] + "</h1>";
        delete response["name"];
        buildTableDocent(response);
        window.location.href = "#table-wrapper";
   }
}

function buildTableDocent(response) {
    const parser = new DOMParser();

    let htmlWithTable = parser.parseFromString(response.html, 'text/html');
    let table = htmlWithTable.querySelector("table");
    setTableAttr(table);
    createTableButtons(table);
    addTableToHtml(table);

    listenCopy();
    listenCSV(response.Name + " Teses");
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


function addTableToHtml(table){
    let tableWrapper = document.querySelector("#table-wrapper");
    tableWrapper.appendChild(table);

    let hiddenTable = document.createElement("table");
    hiddenTable.innerHTML = table.querySelector("thead").innerHTML;
    let hiddenTableBody = document.createElement("tbody");
    table.querySelector("tbody").querySelectorAll("tr").forEach((tr) => {
        let newTr = document.createElement("tr");
        tr.querySelectorAll("td").forEach((td) => {
            let a;
            let newTd = document.createElement("td");
            if ((a = td.querySelector("a")) != null) {
                newTd.innerHTML = a.href;
            }
            else {
                newTd.innerHTML = td.innerHTML;
            }
            newTr.appendChild(newTd);
        });
        hiddenTableBody.appendChild(newTr)
    });
    hiddenTable.appendChild(hiddenTableBody);
    hiddenTable.id = "hidden_table_id";
    hiddenTable.setAttribute("hidden", "true");
    tableWrapper.appendChild(hiddenTable);

    $('#table_id').DataTable();
}
module.exports = {final_handleThesesStd};
