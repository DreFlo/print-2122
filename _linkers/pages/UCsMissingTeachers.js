const { pyCall } = require("../_linkers/pyCall.js");
const { autocomplete } = require("../_linkers/utils/autocomplete.js")
const fs = require('fs');

let toast = new ToastComponent();
let tables;
let courses;
let courseNames;
let selectedTableIndex = undefined;
let modal = document.querySelector('#UCDetailDialog');
let ucIndex = undefined;
let classTypeTitles = {'theoretical' : 'Teóricas', 'practical' : 'Teórico-Práticas', 'laboratorial' : 'Práticas Laboratoriais', 'other' : 'Outras'};
let unregisteredTeachers = JSON.parse(fs.readFileSync('./data/unregistered_teachers.json'))['unregisteredTeachers'];

document.querySelector('#newTableFormButton').addEventListener('click', createNewTable);
document.querySelector('#tableCourseInput').addEventListener('input', autocompleteCourses);
document.querySelector('#closeUCDetailDialog').addEventListener('click', closeUCDialog);
document.querySelector('#saveUCDetailDialog').addEventListener('click', saveUCDialog);
document.querySelector("#tableYearInput").value = new Date().getFullYear();

function autocompleteCourses() {
    closeAutocompleteSugestions();

    let names = autocomplete(this.value, courseNames);

    let div = document.createElement('div');
    div.classList.add('dropdown-menu', 'show', 'autocompleteList');
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
    document.querySelectorAll(".autocompleteList").forEach((elem) => {elem.remove()});    
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
    let div = document.querySelector('#table');

    // Clear table
    div.textContent = '';

    if (selectedTableIndex != undefined) {
        tableInfo = tables[selectedTableIndex];

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
            tr.addEventListener('click', () => {
                ucIndex = getUCIndex(uc.id);
                editedUC = JSON.parse(JSON.stringify((tables[selectedTableIndex].table[ucIndex])));
                editUC();
            });

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

        let deleteButton = document.createElement('button');
        deleteButton.addEventListener('click', deleteSelectedTable);
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.textContent = 'Delete'

        div.appendChild(table);
        div.appendChild(deleteButton);
    }
}

function deleteSelectedTable() {
    removeTable(selectedTableIndex);
    selectedTableIndex = undefined;
    buildTable();
    listTables();
    saveTables();
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
        buildClassTypeArea(body, key);
    });
    
    modal.classList.add('show');
    modal.style = "display: block;";
}

function buildClassTypeArea(body, type) {
    // Title

    let h4 = document.createElement('h4');
    h4.textContent = classTypeTitles[type];
    body.appendChild(h4);

    // Total Time

    let divInputGroup = document.createElement('div');
    divInputGroup.classList.add('input-group', 'mb-2', 'mr-sm-2');

    divInputGroup.innerHTML = '<div class="input-group-prepend"><div class="input-group-text">Tempo de aulas total</div></div>'
    let input = document.createElement('input');
    input.classList.add('form-control');
    input.value = editedUC.info[type].total;
    input.addEventListener('input', () => {editedUC.info[type].total = input.value == '' ? null : input.value});

    divInputGroup.appendChild(input);

    body.appendChild(divInputGroup);

    // Teachers

    if (editedUC.info[type].teachers.length != 0) {
        buildTeachersClassTypeArea(body, type);
    }
}

function buildTeachersClassTypeArea(body, type) {
    let h5 = document.createElement('h5');
    h5.textContent = 'Professores';
    body.appendChild(h5);

    
    let table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'table-bordered');

    let thead = buildTableHead([
        'Nome',
        'Horas lecionadas',
        'Ação'
    ]);
    
    table.appendChild(thead);

    let tbody = document.createElement('tbody');

    editedUC.info[type].teachers.forEach((teacher) => {
        let tr = document.createElement('tr');

        // Teacher Name

        let td = document.createElement('td');
        td.textContent = teacher.name;
        tr.appendChild(td);

        // Teacher Hours

        td = document.createElement('td');
        let input = document.createElement('input');
        input.classList.add('form-control');
        input.value = teacher.hours;
        input.addEventListener('input', () => {
            let newHours = (input.value == '' ? 0 : parseInt(input.value))
            editedUC.info[type].fulfilled = editedUC.info[type].fulfilled - teacher.hours + newHours;
            teacher.hours = newHours;
        });
        td.appendChild(input);
        tr.appendChild(td);

        // Remove Teacher

        td = document.createElement('td');
        let button = document.createElement('button');
        button.classList.add('btn', 'btn-danger');
        button.textContent = 'Remover';
        button.addEventListener('click', () => {
            editedUC.info[type] = removeTeacherFromClassType(type, teacher);
            editUC();
        });
        td.appendChild(button);
        tr.appendChild(td);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    body.appendChild(table);

    addNewTeacherArea(body, type);
}

function removeTeacherFromClassType(classType, teacher) {
    let newClassType = JSON.parse(JSON.stringify(editedUC.info[classType]));
    newClassType.fulfilled -= teacher.hours;
    newClassType.teachers = [];
    editedUC.info[classType].teachers.forEach((oldTeacher) => {
        if (oldTeacher.code == teacher.code) {
            return;
        }
        newClassType.teachers.push(oldTeacher);
    })
    return newClassType;
}

function addNewTeacherArea(body, classType) {
    let div = document.createElement('div');
    div.classList.add("form-flex-row", "m-3");

    let childDiv = document.createElement('div');
    childDiv.style = 'flex: 1;'
    childDiv.innerHTML = 'Adicionar professor não registado';
    div.appendChild(childDiv);

    childDiv = document.createElement('div');
    childDiv.classList.add("input-group", "mb-3", "add-unregistered-teacher-input-div-" + classType);
    childDiv.style = 'flex: 3;';
    let input = document.createElement('input');
    input.classList.add('form-control', 'me-3');
    input.placeholder = 'Nome';
    input.id = 'teacher-name-input-' + classType;
    input.addEventListener('input', () => {autocompleteTeacher(input, classType)});
    childDiv.appendChild(input);
    div.appendChild(childDiv);

    childDiv = document.createElement('div');
    childDiv.classList.add("input-group", "mb-3");
    childDiv.style = 'flex: 1;';
    let input2 = document.createElement('input');
    input2.classList.add('form-control', 'me-3');
    input2.id = 'teacher-hours-input-' + classType;
    input2.placeholder = 'Horas';
    childDiv.appendChild(input2);
    div.appendChild(childDiv);

    childDiv = document.createElement('div');
    childDiv.classList.add("mb-3");
    childDiv.style = 'flex: 1;';
    let button = document.createElement('button');
    button.classList.add('btn', 'btn-success');
    button.textContent = 'Adicionar';
    button.addEventListener('click', () => {addUnregisteredTeacher(classType)});
    childDiv.appendChild(button);
    div.appendChild(childDiv);

    input2 = document.createElement('input');
    input2.id = 'teacher-code-input-' + classType;
    input2.setAttribute('hidden', 'true');
    div.appendChild(input2);

    body.appendChild(div);
}

function findUnregisterTeacherByCode(code) {
    for (let i = 0; i < unregisteredTeachers.length; i++) {
        if (unregisteredTeachers[i].code == code) {
            return unregisteredTeachers[i];
        }
    }
}

function addUnregisteredTeacher(classType) {
    let unregisteredTeacher = findUnregisterTeacherByCode(parseInt(document.querySelector('#teacher-code-input-' + classType).value));
    let hoursInput = document.querySelector('#teacher-hours-input-' + classType).value;
    let hours = hoursInput == '' ? 0 : parseInt(hoursInput);
    let newTeacher = {"name" : unregisteredTeacher.name, "code" : unregisteredTeacher.code, "hours" : hours, "underContract" : false, "contractStart" : unregisteredTeacher.contractStart};
    editedUC.info[classType].teachers.push(newTeacher);
    editedUC.info[classType].fulfilled += hours;
    editUC();
}

function autocompleteTeacher(input, classType) {
    closeAutocompleteSugestions();

    let unregisteredTeacherNames = unregisteredTeachers.map((teacher) => {return teacher.name;});

    let names = autocomplete(input.value, unregisteredTeacherNames);

    let div = document.createElement('div');
    div.classList.add('dropdown-menu', 'show', 'autocompleteList');
    div.style = 'max-height: 300px; overflow-y: auto;';

    let list = document.createElement("ul");
    list.classList.add('list-group');
    
    for (let i = 0; i < unregisteredTeachers.length; i++) {
        if (names.includes(unregisteredTeachers[i]['name'])) {
            a = document.createElement('a');
            a.innerHTML = unregisteredTeachers[i]['name'];
            a.setAttribute('number', courses[i]['code']);
            a.setAttribute('href', '#');
            a.classList.add('list-group-item', 'dropdown-item');
            a.addEventListener('click', () => {handleAddUnregisteredTeacherClick(unregisteredTeachers[i], classType)});
            a.addEventListener('mouseenter', listItemOnMouseEnter);
            a.addEventListener('mouseleave', listItemOnMouseLeave);
            div.appendChild(a);
        }
    }
    
    document.querySelector('.add-unregistered-teacher-input-div-' + classType).appendChild(div);
}

function handleAddUnregisteredTeacherClick(teacher, classType) {
    closeAutocompleteSugestions();
    document.querySelector('#teacher-name-input-' + classType).value = teacher.name;
    document.querySelector('#teacher-code-input-' + classType).value = teacher.code;
}

function closeUCDialog() {
    modal.classList.remove('show');
    modal.style = '';
}

function saveUCDialog() {
    tables[selectedTableIndex].table[ucIndex] = editedUC;
    buildTable();
    saveTables();
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

function saveTables() {
    fs.writeFileSync('./data/uc_teachers_table.json', JSON.stringify({"data" : tables, "error" : false}));
}

function removeTable(index) {
    let newTables = [];
    for (let i = 0; i < tables.length; i++) {
        if (i == index) {
            continue;
        }
        newTables.push(tables[i]);
    }
    tables = newTables;
}

window.onload = function() {
    getTables();
    getCourses();
}