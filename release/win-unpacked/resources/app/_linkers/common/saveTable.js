
// Create the communication with python to copy the table

function createTableButtons() {
    let button = "<div class='button-wrapper d-flex justify-content-start my-3' id='button-wrapper'>" +
        "<button type ='button' class ='copy copy-button btn btn-success me-2' id = 'copy' data-clipboard-target ='table#table_id' data-clipboard-action='copy' >" +
        "<img src='../images/copy-icon.svg' alt='copy' width='15' height='15'/></button> " +
        "<button id = 'toCSV' class ='btn btn-success'>CSV</button></div>" +    //csv button
        "<div id='successMessage'></div><div id='errorMessage'></div>";         //copy/csv success and error
    document.getElementById("table-wrapper").innerHTML = button;
}

/**
 * This function adds a button to copy a specific column.
 */
function createCopyColButton(){
    let copyColumn = "<button type ='button' class ='copy copy-button btn btn-success mx-2' id = 'copy-col' data-clipboard-target ='table#table_id' data-clipboard-action='copy' >"
    copyColumn += "Copiar Códigos</button> " ;
    let buttons = document.querySelector('#button-wrapper');
    buttons.innerHTML += copyColumn;
}

/**
 * this functions listens to the copyButton.
 * @param column
 */
function listenCopyColButton(column){
    const copyColButton = document.querySelector("#copy-col");
    const table = document.querySelector("table");
    copyColButton.addEventListener("click", ()=> {
        pyCall("copy_col_table", "handleCopyColResponse", [table.outerHTML, column])
    })
}


/**
 *  This module will listen the button to copy and will trigger the python action.
 */
function listenCopy(){
    const copyButton = document.querySelector("button.copy");
    const table = document.querySelector("table");
    copyButton.addEventListener("click", ()=> {
        pyCall("copy_table", "handleCopyResponse",table.outerHTML);
    });
}

function listenCSV(){
    const CSVButton = document.querySelector("button#toCSV");
    const table = document.querySelector("table");
    CSVButton.addEventListener("click", ()=> {
        pyCall("csv_table", "handleCSVResponse",table.outerHTML)
    });
}

function handleCopyColResponse(response){
     if (response.error === "true")
        toast.show('Não foi possível copiar a coluna', toast.RED);
    else
        toast.show("Copiado com sucesso!", toast.GREEN);
}

function handleCopyResponse(response){
    if (response.error === "true")
        toast.show('Não foi possível copiar a tabela', toastColor.RED);
    else
        toast.show("Tabela copiada!", toastColor.GREEN);
}

function handleCSVResponse(response){ 
    if (response.error === 'true')
        toast.show('Não foi possível salvar o CSV', toastColor.RED);
    else
        toast.show("CSV salvo!", toastColor.GREEN);
}



module.exports = {createTableButtons, listenCopy, listenCSV, handleCopyResponse, handleCSVResponse}
