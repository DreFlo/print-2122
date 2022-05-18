const { pyCall } = require("../_linkers/pyCall.js");

let toast = new ToastComponent();

document.querySelector("#UC-code-search-button").addEventListener("click", (event) => searchUC(event));
document.querySelector('#UC-analise-conflicts-button').addEventListener('click', analiseConflicts);


// Seacrh for input UCs using sigarra
function searchUC(event) {
    if (getLogged() != "true") {
        toast.show("Não está autenticado", toastColor.RED);
    }
    else {
        event.preventDefault();
        
        code = document.querySelector('#code').value;

        year = document.querySelector('#academic-year').value;
        
        toast.show("A carregar...", toastColor.BLUE, false);

        pyCall("query_uc_code", "handleUCResponse", [code, year]);
    }
}

// List search results in table
function handleUCResponse(data) {
    console.log(data);
    toast.show("Dados carregados!", toastColor.GREEN); 
    let resultsTable = document.querySelector('#searchResultsTable');

    clearTable(resultsTable);

    let tableBody = document.createElement('tbody');

    // For each returned UC
    for (const UC of data['ucs']) {
        let row = document.createElement('tr');
        row.classList.add('result');

        // For each UC information field
        for (let i = 0; i < UC.length; i++) {
            let elem = document.createElement('td');

            // If just information
            if (i !== 3) {
                elem.innerHTML = UC[i];
            }
            // Create button to add UC to conflict calculation 
            else {
                let button = document.createElement('button');
                button.setAttribute('type', 'button');
                button.setAttribute('number', UC[i]);
                button.classList.add('btn', 'btn-success');
                button.addEventListener('click', addUC);
                button.innerHTML = 'Adicionar';
                elem.appendChild(button);
            }

            row.appendChild(elem);
        }

        tableBody.appendChild(row);
    }

    resultsTable.appendChild(tableBody);
    resultsTable.parentNode.removeAttribute('hidden');
}

// Add UC to Selected UCs table
function addUC() {
    
    let resultsTableBody = document.querySelector('#searchResultsTable').querySelector('tbody');

    let selectedUCsTable = document.querySelector('#selectedUCsTable');

    let UCsTableBody = selectedUCsTable.querySelector('tbody');

    let form = document.querySelector('#UCConflictsForm');

    resultsTableBody.removeChild(this.parentNode.parentNode);

    this.removeEventListener('click', addUC);

    this.classList.remove('btn-success');

    this.classList.add('btn-danger');

    this.addEventListener('click', removeUC);

    this.innerHTML = "Remover";

    UCsTableBody.appendChild(this.parentNode.parentNode);

    let input = document.createElement('input');

    input.setAttribute('hidden', '');

    input.value = this.getAttribute('number');

    input.id = this.getAttribute('number');

    form.appendChild(input);

    selectedUCsTable.parentNode.removeAttribute('hidden');

    form.removeAttribute('hidden');
}

// Remove UC from selected UCs table
function removeUC() {
    let UCsTableBody = document.querySelector('#selectedUCsTable').querySelector('tbody');

    let form = document.querySelector('#UCConflictsForm');

    UCsTableBody.removeChild(this.parentNode.parentNode);

    input = document.getElementById(this.getAttribute('number'));

    form.removeChild(input);
}

// Analise conflicts between selected UCs
function analiseConflicts() {
    if (getLogged() != "true") {
        toast.show("Não está autenticado", toastColor.RED);
    }
    else {
        let form = this.parentNode.parentNode;

        let UCNumbers = [];

        for (const input of form.querySelectorAll('input')) {
            UCNumbers.push(input.value);
        }

        console.log(UCNumbers);
        
        toast.show("A carregar...", toastColor.BLUE, false);

        pyCall("check_student_conflicts", "handleConflictResponse", [UCNumbers]);
    }
}

// If results are empty indicate there are no conflicts otherwise show common students between UCs
function handleConflictResponse(data) {
    toast.show("Conflitos carregados!", toastColor.GREEN); 
    let div = document.querySelector('#conflictAnalysisResults');
    div.textContent = '';

    let title = document.querySelector('strong');
    title.innerHTML = 'Conflitos';
    div.appendChild(title);

    if (data['conflict'].length !== 0) {
        let table = document.createElement('table');
        table.classList.add('table');
        table.appendChild(buildTableHead(['Código', 'Nome']));
        let tbody = document.createElement('tbody');

        for (let student of data['conflict']) {
            let tr = document.createElement('tr');

            for (let elem of student) {
                let td = document.createElement('td');
                td.innerHTML = elem;
                tr.appendChild(td);
            }
            
            tbody.appendChild(tr);
        }

        table.appendChild(tbody);
        div.appendChild(table);
    } else {
        let strong = document.createElement('strong');
        strong.innerHTML = 'Não foi detetado nenhum conflito'
        div.appendChild(strong);
    }
}