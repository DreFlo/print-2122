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
let unregisteredTeachers = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/unregistered_teachers.json')))['unregisteredTeachers'];
let tempUnregisteredTeachers;

document.querySelector('#newTableFormButton').addEventListener('click', createNewTable);
document.querySelector('#newTeacherFormButton').addEventListener('click', createNewUnregisteredTeacher);
document.querySelector('#tableCourseInput').addEventListener('input', autocompleteCourses);
document.querySelector('#closeUCDetailDialog').addEventListener('click', closeUCDialog);
document.querySelector('#saveUCDetailDialog').addEventListener('click', saveUCDialog);
document.querySelector("#tableYearInput").value = new Date().getFullYear();
document.querySelector('#collapseTargetOptionsButton').addEventListener('click', toggleCollapseOptions);
document.querySelector('#collapseTargetTeachersButton').addEventListener('click', toggleCollapseTeachers);
document.querySelector('#tableCourseInput').addEventListener('input', () => {document.querySelector('#tableCourseCodeInput').value = ""});

function validateCreateNewTableInput() {
    let nameInput = document.querySelector('#tableNameInput');
    let yearInput = document.querySelector('#tableYearInput');
    let courseInput = document.querySelector('#tableCourseInput');
    let courseIdInput = document.querySelector('#tableCourseCodeInput');
    let ret = true;

    if (nameInput.value == "") {
        setInvalidInput(nameInput, "Este campo não pode estar vazio");
        ret = false;
    }
    else {
        setValidInput(nameInput);
    }
    
    if (yearInput.value == "") {
        setInvalidInput(yearInput, "Este campo não pode estar vazio");
        ret = false;
    }
    else {
        setValidInput(yearInput);
    }

    if (courseIdInput.value == "") {
        if (courseInput.value == "") {
            setInvalidInput(courseInput, "Este campo não pode estar vazio");
        }
        else {
            setInvalidInput(courseInput, "Este campo apenas pode ser preenchindo selecionando uma das opções sugeridas")
        }
        ret = false;
    }
    else {
        setValidInput(courseInput);
    }

    return ret;
}

function validateNewTeacherInput() {
    let nameInput = document.querySelector('#newTeacherNameInput');
    let hoursInput = document.querySelector('#newTeacherAvailableHoursInput');
    let dateInput = document.querySelector('#newTeacherContractStartInput');

    let ret = true;

    if (nameInput.value == "") {
        setInvalidInput(nameInput, "Este campo não pode estar vazio");
        ret = false;
    }
    else {
        setValidInput(nameInput);
    }

    if (hoursInput.value == "") {
        setInvalidInput(hoursInput, "Este campo não pode estar vazio");
        ret = false;
    }
    else if (parseInt(hoursInput.value) <= 0) {
        setInvalidInput(hoursInput, "O valor deste campo tem de ser maior que zero");
        ret = false;
    }
    else {
        setValidInput(hoursInput);
    }

    
    if (document.querySelector('#newTeacherReminderCheckbox').checked) {
        if (dateInput.value == "") {
            setInvalidInput(dateInput, "Para criar um lembrete de início de contrato tem de especificar uma data");
            ret = false;
        }
        else {
            setValidInput(dateInput)
        }
    }
    else {
        setValidInput(dateInput)
    }

    return ret
}

// Get autocomplete results and create HTML and CSS element with results underneath searchbox
function autocompleteCourses() {
    closeAutocompleteSugestions();

    let names = autocomplete(this.value, courseNames);

    let div = document.createElement('div');
    div.id = "dropdown-menu"
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
            a.addEventListener('mousemove', listItemOnMouseMove);
            a.addEventListener('mouseleave', listItemOnMouseLeave);
            div.appendChild(a);
        }
    }

    div.addEventListener('mouseup', function(e) {
        if (!div.contains(e.target)) {
            div.style.display = 'none';
        }
    });
    document.querySelector('#courseInputDiv').appendChild(div);
}

// Set element to active on mouse enter
function listItemOnMouseEnter() {
    this.classList.add('active');
}

// Set element to active on mouse move
function listItemOnMouseMove() {
    let div = document.getElementById("dropdown-menu");
    if(div == null) return;
    let childDiv = div.childNodes;
    for(let i = 0; i < childDiv.length; i++) {
        childDiv[i].classList.remove("active");
    }
    this.classList.add('active');
}


// Remove active from element on mouse leave
function listItemOnMouseLeave() {
    this.classList.remove('active');
}

// Set values for course inputs (words and  course id) and close autocomplete suggestions
function setCourseInput() {
    let input = document.querySelector('#tableCourseCodeInput');
    document.querySelector('#tableCourseInput').value = this.innerHTML;
    input.value = this.getAttribute('number');
    closeAutocompleteSugestions();
}

function closeAutocompleteSugestions() {
    document.querySelectorAll(".autocompleteList").forEach((elem) => {elem.remove()});    
}

// Retrieves all curricular unit, teacher and time info for input course
function createNewTable() {
    if (getLogged() === "false") {
        toast.show("Não está autenticado", toastColor.RED);
    }
    else {
        if (!validateCreateNewTableInput()) return;
        let name = document.querySelector('#tableNameInput').value;
        let year = document.querySelector('#tableYearInput').value;
        let course = document.querySelector('#tableCourseCodeInput').value;
        
        toast.show("A criar...", toastColor.BLUE, false);
        pyCall("retrieve_course_uc_teachers_info", "handleCreateNewTableResponse", [name, course, year]);
    }
}

// Updates tables and redraw table list
function handleCreateNewTableResponse(data) {
    tables = data['data'];
    listTables();
    toast.show("Criada", toastColor.GREEN);
}

// List tables in a user friendly list
function listTables() {
    let ul = document.querySelector('#tableListL');

    if (ul != null) {
        ul.remove();
    }

    ul = document.createElement('ul');
    ul.classList.add("list-group", "list-group-horizontal-md");
    ul.setAttribute('id', 'tableListL');

    // For each table create list element
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

// Set table list item to active and draw table on screen
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

// Get tables from file
function getTables() {
    pyCall("get_uc_teacher_tables", "handleGetTablesResponse", []);
}

// Update tables and list them in a user friendly way
function handleGetTablesResponse(data) {
    tables = data['data'];
    listTables();
}

// Get all cached course info
function getCourses() {
    pyCall("get_courses", "handleCoursesResponse", []);
}

// Update course array and courseNames array for autocomplete
function handleCoursesResponse(data) {
    courses = data['courses'];
    courseNames = [];

    for (let i = 0; i < courses.length; i++) {
        courseNames.push(courses[i]['name']);
    }
}

// Draw course table on screen
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

        // For each UC in table
        for (let i = 0; i < tableInfo.table.length; i++) {
            let uc = tableInfo.table[i];

            let tr = document.createElement('tr');

            // When row is clicked open edit screen for UC
            tr.setAttribute('uc-id', uc.id);
            tr.addEventListener('click', () => {
                ucIndex = getUCIndex(uc.id);
                editedUC = JSON.parse(JSON.stringify((tables[selectedTableIndex].table[ucIndex])));
                tempUnregisteredTeachers = JSON.parse(JSON.stringify(unregisteredTeachers));
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

            // Add each class type (theoretical, practical, ...) to row 
            Object.keys(uc.info).forEach((key) => (addClassTypeToTableRow(tr, uc.info[key])));

            tbody.appendChild(tr);
        }

        table.appendChild(tbody);

        // Button to delete table
        let deleteButton = document.createElement('button');
        deleteButton.addEventListener('click', deleteSelectedTable);
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.textContent = 'Delete'

        div.appendChild(table);
        div.appendChild(deleteButton);
    }
}

// Delete table and redraw UI
function deleteSelectedTable() {
    removeTable(selectedTableIndex);
    selectedTableIndex = undefined;
    buildTable();
    listTables();
    saveTables();
}

// Adds total and fulfilled houses for a class type to a table row 
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
    } 
    // If times don't match set backgorund to red
    else if (_class.total != _class.fulfilled) {
        td.style = "background-color: #dc3545; color: #ffffff";
    }

    tr.appendChild(td);
}

// Open editUC screen
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
    
    // For each class type add edit era
    Object.keys(editedUC.info).forEach((key) => {
        buildClassTypeArea(body, key);
    });
    
    modal.classList.add('show');
    modal.style = "display: block;";
}

// Draw edit area for a given class type
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
    input.setAttribute("type", "number");
    input.setAttribute("min", "0");
    input.value = editedUC.info[type].total;
    // Change total on input
    input.addEventListener('input', () => {
        if (input.value == "-") return;
        if (parseInt(input.value) < 0) {
            input.classList.remove("is-valid");
            input.classList.add("is-invalid");
        
            divInputGroup.appendChild(div);
        }
        else {
            input.classList.remove("is-invalid");
            input.classList.add("is-valid");
            editedUC.info[type].total = input.value == '' ? null : input.value
        }
    });

    divInputGroup.appendChild(input);

    body.appendChild(divInputGroup);

    // Teachers

    if (editedUC.info[type].teachers.length != 0) {
        buildTeachersClassTypeArea(body, type);
    }

    addNewTeacherArea(body, type);
}

// List and edit teachers for a given class type
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

        let tdInput = document.createElement('td');
        let input = document.createElement('input');
        input.classList.add('form-control');
        input.setAttribute("type", "number");
        input.setAttribute("min", "0");
        input.value = teacher.hours;
        // On input change teacher hours and update UC
        input.addEventListener('input', () => {
            let newHours = (input.value == '' ? 0 : parseInt(input.value))
            let unregisteredTeacher = getUnregisteredTeacherById(teacher.code);
            if (newHours < 0) {
                input.classList.remove("is-valid");
                input.classList.add("is-invalid");

                let div = tdInput.querySelector("div");
                if (div!=null) tdInput.removeChild(div);
                div = document.createElement("div");
                div.classList.add("alert", "alert-danger");
                div.textContent = "O número de horas atribuídas tem de ser maior que zero";
                tdInput.appendChild(div);
            }
            // Trying to set teacher hours to a value that would exceed their available hours
            else if (unregisteredTeacher != null && unregisteredTeacher.availableHours < unregisteredTeacher.assignedHours - teacher.hours + newHours) {
                input.classList.remove("is-valid");
                input.classList.add("is-invalid");

                let div = tdInput.querySelector("div");
                if (div!=null) tdInput.removeChild(div);
                div = document.createElement("div");
                div.classList.add("alert", "alert-danger");
                div.textContent = "O número de horas atribuídas totais do professor seria maior do que o número de horas disponíveis";
                tdInput.appendChild(div);
            }
            else {
                let div = tdInput.querySelector("div");
                if (div!=null) tdInput.removeChild(div);
                input.classList.remove("is-invalid");
                input.classList.add("is-valid");
                editedUC.info[type].fulfilled = editedUC.info[type].fulfilled - teacher.hours + newHours;
                teacher.hours = newHours;
            }
        });
        tdInput.appendChild(input);
        tr.appendChild(tdInput);

        // Remove Teacher

        td = document.createElement('td');
        let button = document.createElement('button');
        button.classList.add('btn', 'btn-danger');
        button.textContent = 'Remover';
        // Remove teacher and redraw screen
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

}

// Handle removing teacher from a UC class type
function removeTeacherFromClassType(classType, teacher) {
    // Deepcopy
    let newClassType = JSON.parse(JSON.stringify(editedUC.info[classType]));
    newClassType.fulfilled -= teacher.hours;
    newClassType.teachers = [];

    // Add teachers
    editedUC.info[classType].teachers.forEach((oldTeacher) => {
        if (oldTeacher.code == teacher.code) {
            return;
        }
        newClassType.teachers.push(oldTeacher);
    });

    // If teacher is not registered in sigarra update their assigned hours
    if (!teacher.underContract) {
        removeAssignedHoursFromUnregisteredTeacher(teacher);
    }

    return newClassType;
}

// Update teacher hours
function removeAssignedHoursFromUnregisteredTeacher(teacher) {
    tempUnregisteredTeachers.forEach((uT) => {
        if (uT.code == teacher.code) {
            uT.assignedHours -= teacher.hours;
        }
    });
}

function validateAddNewTeacher(classType) {
    let nameInput = document.getElementById('teacher-name-input-' + classType);
    let hoursInput = document.getElementById('teacher-hours-input-' + classType);
    let codeInput = document.getElementById('teacher-code-input-' + classType);

    let ret = true;
    
    let teacher = getUnregisteredTeacherById(parseInt(codeInput.value));

    if (hoursInput.value == "") {
        setInvalidInput(hoursInput, "Este campo não pode estar vazio");
        ret = false;
    }
    else if (teacher.availableHours < teacher.assignedHours + parseFloat(hoursInput.value)) {
        setInvalidInput(hoursInput, "O número de horas atribuídas totais do professor seria maior do que o número de horas disponíveis");
        ret = false;
    }
    else {
        setValidInput(hoursInput);
    }

    if (nameInput.value = "") {
        setInvalidInput(nameInput, "Este campo não pode estar vazio");
        ret = false;
    }
    else if (teacher == null) {
        setInvalidInput(nameInput, "Tem de ser selecionado um professor da lista dos sugeridos");
        ret = false;
    }
    else {
        setValidInput(nameInput);
    }

    return ret;
}

// Draw area to add new teacher to class type in UC
function addNewTeacherArea(body, classType) {
    let div = document.createElement('div');
    div.classList.add("form-flex-row", "m-3");

    // Title
    let childDiv = document.createElement('div');
    childDiv.style = 'flex: 1;'
    childDiv.innerHTML = 'Adicionar professor não registado';
    div.appendChild(childDiv);

    // Searchbox
    childDiv = document.createElement('div');
    childDiv.classList.add("input-group", "mb-3", "add-unregistered-teacher-input-div-" + classType);
    childDiv.id="add-unregistered-teacher-input-div-" + classType;
    childDiv.style = 'flex: 3;';
    let input = document.createElement('input');
    input.classList.add('form-control', 'me-3');
    input.placeholder = 'Nome';
    input.id = 'teacher-name-input-' + classType;
    // On inputshow autocomplete suggestions
    childDiv.appendChild(input);
    childDiv.innerHTML += "<div class=\"invalid-tooltip\"></div>";
    div.appendChild(childDiv);


    // Hours input
    childDiv = document.createElement('div');
    childDiv.classList.add("input-group", "mb-3");
    childDiv.style = 'flex: 1;';
    let input2 = document.createElement('input');
    input2.classList.add('form-control', 'me-3');
    input2.id = 'teacher-hours-input-' + classType;
    input2.placeholder = 'Horas';
    childDiv.appendChild(input2);
    childDiv.innerHTML += "<div class=\"invalid-tooltip\"></div>";
    div.appendChild(childDiv);

    // Button to add teacher to class type
    childDiv = document.createElement('div');
    childDiv.classList.add("mb-3");
    childDiv.style = 'flex: 1;';
    let button = document.createElement('button');
    button.classList.add('btn', 'btn-success');
    button.textContent = 'Adicionar';
    button.addEventListener('click', () => {
        if (validateAddNewTeacher(classType)) {
            addUnregisteredTeacher(classType);
        }
    });
    childDiv.appendChild(button);
    div.appendChild(childDiv);

    // Hidden input for teacher code
    input2 = document.createElement('input');
    input2.id = 'teacher-code-input-' + classType;
    input2.setAttribute('hidden', 'true');
    div.appendChild(input2);

    body.appendChild(div); 


    document.querySelector('#teacher-name-input-' + classType).addEventListener('input', () => {autocompleteTeacher(document.querySelector('#teacher-name-input-' + classType), classType); document.querySelector('#teacher-code-input-' + classType).value = "";});
}

function findUnregisterTeacherByCode(code) {
    for (let i = 0; i < tempUnregisteredTeachers.length; i++) {
        if (tempUnregisteredTeachers[i].code == code) {
            return tempUnregisteredTeachers[i];
        }
    }
}

// Handle adding unregisterd teacher to class type in UC
function addUnregisteredTeacher(classType) {
    let unregisteredTeacher = findUnregisterTeacherByCode(parseInt(document.querySelector('#teacher-code-input-' + classType).value));
    let hoursInput = document.querySelector('#teacher-hours-input-' + classType).value;
    let hours = hoursInput == '' ? 0 : parseFloat(hoursInput);
    if (unregisteredTeacher.assignedHours + hours > unregisteredTeacher.availableHours) {
        toast.show('Este/a professor/a apenas está disponível por ' + unregisteredTeacher.availableHours + ' semanalmente, o total seria ' + (unregisteredTeacher.assignedHours + hours), toastColor.RED);
    }
    else {
        let newTeacher = {"name" : unregisteredTeacher.name, "code" : unregisteredTeacher.code, "hours" : hours, "underContract" : false, "contractStart" : unregisteredTeacher.contractStart};
        editedUC.info[classType].teachers.push(newTeacher);
        editedUC.info[classType].fulfilled += hours;
        unregisteredTeacher.assignedHours += hours;
        editUC();
    }
}

// Show autocomplete dorpdown for teacher search owhen editing UC
function autocompleteTeacher(input, classType) {
    closeAutocompleteSugestions();

    let unregisteredTeacherNames = unregisteredTeachers.map((teacher) => {return teacher.name;});

    let names = autocomplete(input.value, unregisteredTeacherNames);

    let div = document.createElement('div');
    div.id = "dropdown-menu";
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
            a.addEventListener('mousemove', listItemOnMouseMove);
            a.addEventListener('mouseleave', listItemOnMouseLeave);
            div.appendChild(a);
        }
    }



    document.querySelector("#add-unregistered-teacher-input-div-" + classType).appendChild(div);
}



// Close autocomplete suggesting for teachers and set inputs
function handleAddUnregisteredTeacherClick(teacher, classType) {
    closeAutocompleteSugestions();
    document.querySelector('#teacher-name-input-' + classType).value = teacher.name;
    document.querySelector('#teacher-code-input-' + classType).value = teacher.code;
}

// Close edit UC dialog
function closeUCDialog() {
    modal.classList.remove('show');
    modal.style = '';
}

// Save changes to UC and close edit dialog
function saveUCDialog() {
    tables[selectedTableIndex].table[ucIndex] = editedUC;
    buildTable();
    saveTables();
    saveUnregisteredTeachers();
    closeUCDialog();
}

// Get index for UC in table list
function getUCIndex(id) {
    table = tables[selectedTableIndex];

    for (let i = 0; i < table.table.length; i++) {
        if (table.table[i].id == id) {
            return i;
        }
    }
}

// Save tables to file
function saveTables() {
    fs.writeFileSync(path.join(__dirname, '../data/uc_teachers_table.json'), JSON.stringify({"data" : tables, "error" : false}));
}

// Remove table from table array
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

// Create new unregistered teacher
function createNewUnregisteredTeacher() {
    if (!validateNewTeacherInput()) return;
    let name = document.querySelector('#newTeacherNameInput').value;
    let hours = document.querySelector('#newTeacherAvailableHoursInput').value;
    let date = new Date(document.querySelector('#newTeacherContractStartInput').value);
    let reminder = document.querySelector('#newTeacherReminderCheckbox').checked;
    
    toast.show("A criar...", toastColor.BLUE, false);
    pyCall("add_unregistered_teacher", "handleAddUnregisteredTeacher", [name, hours, date.toISOString(), reminder]);
}

// Update unregistered teachers
function handleAddUnregisteredTeacher(data) {
    if (data.error == "true") {
        toast.show("Erro ao guardar docente", toastColor.RED);
    }
    else {
        unregisteredTeachers = data['unregisteredTeachers'];
        toast.show("Criado", toastColor.GREEN);
    }
}

// Save unregistered teachers to file
function saveUnregisteredTeachers() {
    unregisteredTeachers = JSON.parse(JSON.stringify(tempUnregisteredTeachers));
    fs.writeFileSync(path.join(__dirname, '../data/unregistered_teachers.json'), JSON.stringify({"unregisteredTeachers" : unregisteredTeachers, "error" : false}));
}

// Toggle showing options for Course tables
function toggleCollapseOptions() {
    let target = document.querySelector("#collapseTargetOptions");
    if (target.classList.contains("collapse")) {
        target.classList.remove("collapse");
        this.classList.add("btn-danger");
        this.classList.remove("btn-primary");
        this.textContent = "Esconder Opções";
    }
    else {
        target.classList.add("collapse");
        this.classList.remove("btn-danger");
        this.classList.add("btn-primary");
        this.textContent = "Mostar Opções";
    }
}

// Toggle showing unregistered teachers list
function toggleCollapseTeachers() {
    let target = document.querySelector("#collapseTargetTeachers");
    if (target.classList.contains("collapse")) {
        target.classList.remove("collapse");
        this.classList.add("btn-danger");
        this.classList.remove("btn-primary");
        this.textContent = "Esconder Professores";
        target.textContent = '';
        buildUnregisteredTeachersTable();
    }
    else {
        target.classList.add("collapse");
        this.classList.remove("btn-danger");
        this.classList.add("btn-primary");
        this.textContent = "Mostar Professores Não Registados";
    }
}

// Draw unregisterd teachers table
function buildUnregisteredTeachersTable() {
    let div = document.querySelector("#collapseTargetTeachers");
    let table = document.createElement('table');
    table.classList.add('table', 'table-hover', 'table-striped', 'table-bordered');

    let thead = buildTableHead([
        'Nome',
        'Horas Disponíveis',
        'Horas Atribuídas',
        'Início de Contrato'
    ]);
    
    table.appendChild(thead);

    let tbody = document.createElement('tbody');

    tempUnregisteredTeachers = JSON.parse(JSON.stringify(unregisteredTeachers))

    // For each teacher
    for (let i = 0; i < tempUnregisteredTeachers.length; i++) {
        let teacher = tempUnregisteredTeachers[i];

        let tr = document.createElement('tr');

        // Teacher Name
        let td = document.createElement('td');

        td.textContent = teacher.name;

        tr.appendChild(td);

        // Available Hours
        tdInput = document.createElement('td');

        let input = document.createElement('input');
        input.setAttribute("type", "number");
        input.setAttribute("min", "0");
        input.classList.add('form-control');
        input.value = teacher.availableHours;
        input.addEventListener('input', () => {
            let newHours = (input.value == '' ? 0 : parseInt(input.value))
            if (newHours < teacher.assignedHours) {
                // Show error message to user
                input.classList.remove("is-valid");
                input.classList.add("is-invalid");
                
                
                let div = tdInput.querySelector("div");
                if (div!=null) tdInput.removeChild(div);
                div = document.createElement("div");
                div.classList.add("alert", "alert-danger");
                div.textContent = "Este professor já está atribuído a mais que " + newHours + " horas";
                tdInput.appendChild(div);
            }
            else {
                // Show value is ok to user and store temporarily
                let div = tdInput.querySelector("div");
                if (div!=null) tdInput.removeChild(div);
                input.classList.remove("is-invalid");
                input.classList.add("is-valid");
                teacher.availableHours = newHours;
            }
        });
        tdInput.appendChild(input);

        tr.appendChild(tdInput);

        // Assigned Hours
        td = document.createElement('td');

        td.textContent = teacher.assignedHours;

        tr.appendChild(td);

        // Contract Start
        td = document.createElement('td');

        let date = new Date(teacher.contractStart)

        td.textContent = date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();

        tr.appendChild(td);


        tbody.appendChild(tr);
    }

    table.appendChild(tbody);

    
    let save = document.createElement('button');
    save.addEventListener('click', saveUnregisteredTeachers);
    save.classList.add('btn', 'btn-success');
    save.textContent = 'Guardar Alterações'

    div.appendChild(table);
    div.appendChild(save);
}

function getUnregisteredTeacherById(id) {
    for (let i = 0; i < unregisteredTeachers.length; i++) {
        if (unregisteredTeachers[i].code == id) {
            return unregisteredTeachers[i];
        }
    }
    return null;
}

window.onload = function() {
    getTables();
    getCourses();
}