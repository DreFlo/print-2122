const { pyCall } = require("../_linkers/pyCall.js");
const { autocomplete } = require("../_linkers/utils/autocomplete.js")

let toast = new ToastComponent();
let tables;
let courses;
let courseNames;
let selectedTableIndex = 0;

document.querySelector('#newTableFormButton').addEventListener('click', createNewTable);
document.querySelector('#tableCourseInput').addEventListener('input', autocompleteCourses);

function autocompleteCourses() {
    closeAutocompleteSugestions();

    let names = autocomplete(this.value, courseNames);

    let div = document.createElement('div');
    div.classList.add('dropdown-menu', 'show');
    div.setAttribute('id', 'autocompleteList');

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
    console.log(data);
    tables = data;
}

function listTables() {
    let ul = document.querySelector('#tableListL');

    if (ul != null) {
        ul.remove();
    }

    ul = document.createElement('ul');
    ul.classList.add("list-group", "list-group-horizontal-md");
    for (let i = 0; i < tables.length; i++) {
        let li = document.createElement('li');
        li.classList.add("list-group-item");
        li.innerHTML = tables[i].name;
        ul.appendChild(li);
    }
    document.querySelector('#tableList').appendChild(ul);
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

function buildTable(tableNumber) {
    tableInfo = tables[tableNumber];


}

window.onload = function() {
    getTables();
    getCourses();
}