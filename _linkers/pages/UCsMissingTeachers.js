const { pyCall } = require("../_linkers/pyCall.js");
const { autocomplete } = require("../_linkers/utils/autocomplete.js");
const { items } = require("../_linkers/utils/items.js");

let toast = new ToastComponent();
let tables;
let courses;
let courseNames;
let selectedTableIndex = undefined;

document.querySelector('#newTableFormButton').addEventListener('click', createNewTable);
document.querySelector('#tableCourseInput').addEventListener('input', autocompleteCourses);

function autocompleteCourses() {
    closeAutocompleteSugestions();

    let names = autocomplete(this.value, courseNames);

    let div = document.createElement('div');
    div.classList.add('dropdown-menu', 'show');
    div.setAttribute('id', 'autocompleteList');
    div.style = 'max-height: 300px; overflow-y: auto;';

    let list = document.createElement("ul");
    list.classList.add('list-group');
    
    for (let i = 0; i < courses.length; i++) {
        if (names.includes(courses[i]['name'])) {
            a = document.createElement('a');
            a.innerHTML = courses[i]['name'];
            a.setAttribute('number', courses[i]['code']);
            a.setAttribute('href', '#');
            a.addEventListener('click', setCourseInput)
            a.classList.add('list-group-item', 'dropdown-item');
            a.addEventListener('mouseenter', listItemOnMouseEnter);
            a.addEventListener('mouseleave', listItemOnMouseLeave);
            div.appendChild(a);
        }
    }

    document.querySelector('#courseInputDiv').appendChild(div);
}

function listItemOnMouseEnter() {
    this.classList.add('active');
}

function listItemOnMouseLeave() {
    this.classList.remove('active');
}

function setCourseInput() {
    let input = document.querySelector('#tableCourseCodeInput');
    document.querySelector('#tableCourseInput').value = this.innerHTML;
    input.value = this.getAttribute('number');
    closeAutocompleteSugestions();
}

function closeAutocompleteSugestions() {
    let list = document.querySelector("#autocompleteList");
    if (list != null) {
        list.remove();
    }
}

function createNewTable() {
    let name = document.querySelector('#tableNameInput').value;
    let year = document.querySelector('#tableYearInput').value;
    let course = document.querySelector('#tableCourseCodeInput').value;
    pyCall("retrieve_course_uc_teachers_info", "handleCreateNewTableResponse", [name, course, year]);
}

function handleCreateNewTableResponse(data) {
    tables = data['data'];
    listTables();
}

function listTables() {
    let ul = document.querySelector('#tableListL');

    if (ul != null) {
        ul.remove();
    }

    ul = document.createElement('ul');
    ul.classList.add("list-group", "list-group-horizontal-md");
    ul.setAttribute('id', 'tableListL');
    for (let i = 0; i < tables.length; i++) {
        let li = document.createElement('li');
        li.classList.add("list-group-item");
        li.innerHTML = tables[i].name;
        li.setAttribute('tableIndex', i);
        li.addEventListener('mouseenter', listItemOnMouseEnter);
        li.addEventListener('mouseleave', listItemOnMouseLeave);
        li.addEventListener('click', selectTable);
        ul.appendChild(li);
    }
    document.querySelector('#tableList').appendChild(ul);
}

function selectTable() {
    selectedTableIndex = this.getAttribute('tableIndex');

    let activeListItems = document.querySelector('#tableListL').querySelectorAll('.active');

    for (let i = 0; i < activeListItems.length; i++) {
        activeListItems[i].classList.remove('active');

        activeListItems[i].addEventListener('mouseenter', listItemOnMouseEnter);
        activeListItems[i].addEventListener('mouseleave', listItemOnMouseLeave);
    }

    this.classList.add('active');

    // Remove hover effect
    this.removeEventListener('mouseenter', listItemOnMouseEnter);
    this.removeEventListener('mouseleave', listItemOnMouseLeave);

    buildTable();
}

function getTables() {
    pyCall("get_uc_teacher_tables", "handleGetTablesResponse", []);
}

function handleGetTablesResponse(data) {
    tables = data['data'];
    listTables();
}


function handleCoursesResponse(data) {
    courses = data['courses'];
    courseNames = [];

    for (let i = 0; i < courses.length; i++) {
        courseNames.push(courses[i]['name']);
    }
}

function buildTable() {
    tableInfo = tables[selectedTableIndex];

    let div = document.querySelector('#table');

    // Clear table
    div.textContent = '';

    let h1 = document.createElement('h1');
    h1.textContent = tableInfo.name;

    div.appendChild(h1);

    let table = document.createElement('table');
    table.classList.add('table', 'table-hover', 'table-striped', 'table-bordered');

    let thead = buildTableHead([
        'Unidade Curricular', 
        'Total Teóricas', 
        'Teóricas Atribuídas', 
        'Total Práticas', 
        'Práticas Atribuídas'
    ]);
    
    table.appendChild(thead);

    let tbody = document.createElement('tbody');

    for (let i = 0; i < tableInfo.table.length; i++) {
        let uc = tableInfo.table[i];

        let tr = document.createElement('tr');
        tr.setAttribute('uc-id', uc.id);
        tr.addEventListener('click', editUC);

        // UC Name
        let td = document.createElement('td');

        td.textContent = uc.name;

        tr.appendChild(td);

        // Theoretical Total
        td = document.createElement('td');

        if (uc.info.theoretical.total == null) {
            td.textContent = "N/A"
        } else {
            td.textContent = uc.info.theoretical.total;
        }

        tr.appendChild(td);

        // Theoretical Fulfilled
        td = document.createElement('td');

        td.textContent = uc.info.theoretical.fulfilled;

        if (uc.info.theoretical.total != uc.info.theoretical.fulfilled) {
            td.style = "background-color: #dc3545; color: #ffffff";
        }

        tr.appendChild(td);

        // Practical Total
        td = document.createElement('td');

        if (uc.info.practical.total == null) {
            td.textContent = "N/A"
        } else {
            td.textContent = uc.info.practical.total;
        }

        tr.appendChild(td);

        // Practical Fulfilled
        td = document.createElement('td');

        td.textContent = uc.info.practical.fulfilled;

        if (uc.info.practical.total != uc.info.practical.fulfilled) {
            td.style = "background-color: #dc3545; color: #ffffff";
        }

        tr.appendChild(td);

        tbody.appendChild(tr);
    }

    table.appendChild(tbody);

    div.appendChild(table);
}

function editUC() {
    uc = getUC(this.getAttribute('uc-id'));
    console.log(uc);
}

function getUC(id) {
    table = tables[selectedTableIndex];

    for (let i = 0; i < table.table.length; i++) {
        if (table.table[i].id == id) {
            return table.table[i];
        }
    }
}

window.onload = function() {
    getTables();
    items.getCourses();
}