const { pyCall } = require("../_linkers/pyCall.js");
const { autocomplete } = require("../_linkers/utils/autocomplete.js")

let toast = new ToastComponent();
let tables;
let courses;
let courseNames;
let selectedTableIndex = undefined;
let modal = document.querySelector('#UCDetailDialog');
let ucIndex = undefined;
let classTypeTitles = {'theoretical' : 'Teóricas', 'practical' : 'Teórico-Práticas', 'laboratorial' : 'Práticas Laboratoriais', 'other' : 'Outras'};

document.querySelector('#newTableFormButton').addEventListener('click', createNewTable);
document.querySelector('#tableCourseInput').addEventListener('input', autocompleteCourses);
document.querySelector('#closeUCDetailDialog').addEventListener('click', closeUCDialog);
document.querySelector('#saveUCDetailDialog').addEventListener('click', saveUCDialog);

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
    
    toast.show("A criar...", toastColor.BLUE, false);
    pyCall("retrieve_course_uc_teachers_info", "handleCreateNewTableResponse", [name, course, year]);
}

function handleCreateNewTableResponse(data) {
    tables = data['data'];
    listTables();
    toast.show("Criada", toastColor.GREEN);
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

function getCourses() {
    pyCall("get_courses", "handleCoursesResponse", []);
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
        'Código',
        'Período',
        'Teóricas', 
        'Teóricas Atribuídas', 
        'Práticas', 
        'Práticas Atribuídas',
        'Laboratoriais',
        'Laboratoriais Atribuídas',
        'Outras',
        'Outras Atribuídas'
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

        // UC Code
        td = document.createElement('td');

        td.textContent = uc.code;

        tr.appendChild(td);

        // UC Period
        td = document.createElement('td');

        td.textContent = uc.period;

        tr.appendChild(td);

        Object.keys(uc.info).forEach((key) => (addClassTypeToTableRow(tr, uc.info[key])));

        tbody.appendChild(tr);
    }

    table.appendChild(tbody);

    div.appendChild(table);
}

function addClassTypeToTableRow(tr, _class) {
    let td = document.createElement('td');

    if (_class.total == null) {
        td.textContent = "N/A"
        td.style = "background-color: #848884; color: #ffffff"
    } else {
        td.textContent = _class.total;
    }

    tr.appendChild(td);

    td = document.createElement('td');

    td.textContent = _class.fulfilled;

    if (_class.total == null) {
        td.textContent = "N/A"
        td.style = "background-color: #848884; color: #ffffff"
    } else if (_class.total != _class.fulfilled) {
        td.style = "background-color: #dc3545; color: #ffffff";
    }

    tr.appendChild(td);
}

function editUC() {
    ucIndex = getUCIndex(this.getAttribute('uc-id'));

    editedUC = JSON.parse(JSON.stringify((tables[selectedTableIndex].table[ucIndex])));

    let title = modal.querySelector(".modal-title");
    title.textContent = editedUC.name;

    let body = modal.querySelector('.modal-body');
    body.textContent = '';

    let h6 = document.createElement('h6');
    h6.textContent = editedUC.code;
    body.appendChild(h6);
    h6 = document.createElement('h6');
    h6.textContent = editedUC.period;
    body.appendChild(h6);
    
    Object.keys(editedUC.info).forEach((key) => {
        let object = editedUC.info[key];
        let h4 = document.createElement('h4');
        h4.textContent = classTypeTitles[key];
        body.appendChild(h4);

        let input = document.createElement('input');
        input.value = object.total;
        input.addEventListener('input', () => {object.total = input.value});

        body.appendChild(input);
    })
    
    modal.classList.add('show');
    modal.style = "display: block;";
}

function closeUCDialog() {
    modal.classList.remove('show');
    modal.style = '';
}

function saveUCDialog() {
    console.log(editedUC);
    tables[selectedTableIndex].table[ucIndex] = editedUC;
    buildTable();
    closeUCDialog();
}

function getUCIndex(id) {
    table = tables[selectedTableIndex];

    for (let i = 0; i < table.table.length; i++) {
        if (table.table[i].id == id) {
            return i;
        }
    }
}

window.onload = function() {
    getTables();
    getCourses();
}