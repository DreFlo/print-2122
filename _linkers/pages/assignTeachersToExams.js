const { pyCall } = require("../_linkers/pyCall.js");
const { autocomplete } = require("../_linkers/utils/autocomplete.js")
const fs = require('fs');
const { TimeFrame } = require("../_linkers/utils/TimeFrame.js");

let toast;

let courses;
let courseNames;
let exams;
let selectedSearchResult = undefined;
let docentsCodeArray;
let use_class_schedule;
let use_exam_schedule;
let date;
let availableTeachers;

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

function closeAutocompleteSugestions() {
    document.querySelectorAll(".autocompleteList").forEach((elem) => {elem.remove()});    
}

function setCourseInput() {
    let input = document.querySelector('#examCourseCodeInput');
    document.querySelector('#examCourseInput').value = this.innerHTML;
    input.value = this.getAttribute('number');
    closeAutocompleteSugestions();
}

// Set element to active on mouse enter
function listItemOnMouseEnter() {
    this.classList.add('active');
}

// Remove active from element on mouse leave
function listItemOnMouseLeave() {
    this.classList.remove('active');
}

function searchExam() {
    if (!validateSearchExamInput()) return;

    let courseCode = document.querySelector('#examCourseCodeInput').value;
    let uc = document.querySelector('#examUCInput').value.trim();

    pyCall("search_exams", "handleSearchExamsResponse", [courseCode, uc]);
}

function handleSearchExamsResponse(data) {
    console.log(data);
    let searchExamDiv = document.querySelector('#searchResultsDiv');

    exams = data['exams'];

    if (data['exams'].length !== 0) {
        console.log(data['exams']);
        let table = document.createElement('table');
        table.classList.add('table', 'table-hover', 'table-striped', 'table-bordered');
        table.appendChild(buildTableHead(['Tipo', 'Data', 'Horas']))
        let tbody = document.createElement('tbody');

        for (let i = 0; i < data['exams'].length; i++) {
            let exam = data['exams'][i];
            let tr = document.createElement('tr');
            tr.classList.add("exam-search-result-row");
            tr.setAttribute("result-index", i);

            tr.addEventListener('click', selectExamSearchResult);

            for (let [key, value] of Object.entries(exam)) {
                if (key == 'type' || key == 'date' || key == 'hour') {
                    let td = document.createElement('td');
                    td.textContent = value;
                    tr.appendChild(td);
                }
            }

            tbody.appendChild(tr);
        }

        table.appendChild(tbody);

        searchExamDiv.appendChild(table);
    }
    else {
        let strong = document.createElement('strong');
        strong.innerHTML = 'Não foram encontrados exames que correspondam à pesquisa'
        searchExamDiv.appendChild(strong);
    }
}

function selectExamSearchResult() {
    this.classList.add("table-primary");
    this.removeEventListener('click', selectExamSearchResult);
    this.addEventListener('click', deselectExamSearchresult);

    setSelectedSearchResult(exams[parseInt(this.getAttribute("result-index"))]);

    for (let resultRow of document.querySelectorAll(".exam-search-result-row")) {
        if (resultRow.getAttribute("result-index") !== this.getAttribute("result-index")) {
            resultRow.classList.remove("table-primary");
            resultRow.addEventListener('click', selectExamSearchResult);
            resultRow.removeEventListener('click', deselectExamSearchresult);
        }
    }
}

function deselectExamSearchresult() {
    this.classList.remove("table-primary");
    this.addEventListener('click', selectExamSearchResult);
    this.removeEventListener('click', deselectExamSearchresult);

    setSelectedSearchResult(undefined);
}

function validateSearchExamInput() {
    let courseInput = document.querySelector('#examCourseInput');
    let courseCodeInput = document.querySelector('#examCourseCodeInput');
    let ucInput = document.querySelector('#examUCInput');
    let ret = true;

    if (ucInput.value.trim() == "") {
        setInvalidInput(ucInput, "Este campo tem de ser preenchido");
        ret = false;
    }
    else {
        setValidInput(ucInput);
    }

    if (courseCodeInput.value.trim() == "") {
        if (courseInput.value.trim() == "") {
            setInvalidInput(courseInput, "Este campo tem de ser preenchido");
        }
        else {
            setInvalidInput(courseInput, "Este campo apenas pode ser preenchindo selecionando uma das opções sugeridas");
        }
        ret = false;
    }
    else {
        setValidInput(courseInput);
    }

    return ret;
}

function setSelectedSearchResult(result) {
    let button = document.querySelector('#assignButton');
    if (result === undefined) {
        if (button !== null) {
            button.remove();
        }
    }
    else {
        if (button === null) {
            let buttonDiv = document.querySelector('#assignButtonDiv');

            button = document.createElement('button');
            button.classList.add("btn", "btn-success");
            button.id = "assignButton";
            button.textContent = "Atribuir";
            button.addEventListener('click', assignTeachers);

            buttonDiv.appendChild(button);
        }
    }
    selectedSearchResult = result;
}

function assignTeachers() {
    let schedule_type = document.querySelector("#scheduleType").value;
    date = selectedSearchResult['date'];

    use_class_schedule = false;
    use_exam_schedule = false;
    switch(schedule_type) {
        case "classes":
            use_class_schedule = true;
            break;
        case "exams":
            use_exam_schedule = true;
            break;
        case "both":
            use_class_schedule = true;
            use_exam_schedule = true;
            break;
    }

    let groupedScheds = groupByDate()
    console.log(groupedScheds);
    let freeTeachers = getFreeTeachers(groupedScheds);
    console.log(freeTeachers);
}

function groupByDate() {
    let groupedScheds = {}
    docentsCodeArray = document.querySelector("#code").value.split(" ").map(element => element.trim());
    let inputTimeFrame = new TimeFrame(stringToDate_yyyymmdd(date), stringToDate_yyyymmdd(date));
    let scheduleJson = JSON.parse(readSchedule());

    docentsCodeArray.forEach(id => {
        if(use_class_schedule){
            scheduleJson[id]['class_schedule']['schedule'].forEach(sched => {     
                let currTimeFrame = new TimeFrame(stringToDate_ddmmyyyy(sched.start_date), stringToDate_ddmmyyyy(sched.end_date));  
                if (currTimeFrame.isOverlapping(inputTimeFrame) || inputTimeFrame.isOverlapping(currTimeFrame)) { 
                    sched['teacher'] = id; 
                    let key = currTimeFrame.toString(); 
                    if (groupedScheds.hasOwnProperty(key))  groupedScheds[key].push(sched);
                    else groupedScheds[key] = [sched];
                }
            });
        }

        if(use_exam_schedule){
            scheduleJson[id]['exam_schedule']['schedule'].forEach(sched => {     
                let currTimeFrame = new TimeFrame(stringToDate_ddmmyyyy(sched.start_date), stringToDate_ddmmyyyy(sched.end_date));  
                if (currTimeFrame.isOverlapping(inputTimeFrame) || inputTimeFrame.isOverlapping(currTimeFrame)) { 
                    sched['teacher'] = id; 
                    let key = currTimeFrame.toString(); 
                    if (groupedScheds.hasOwnProperty(key))  groupedScheds[key].push(sched);
                    else groupedScheds[key] = [sched];
                }
            });
        } 
    })

    return groupedScheds;
}

function getFreeTeachers(sched) {
    let free = [];
    for (let teacher of docentsCodeArray) {
        if (selectedSearchResult['teachers'].includes(parseInt(teacher))) continue;
        let times = teacherInSchedule(sched, teacher);
        if (times == []) {
            free.push(teacher);
        }
        else {
            let add = true;
            for (let time of times) {
                if (time['day'] == selectedSearchResult['day']) {
                    if (timesIntersect(time, selectedSearchResult)) {
                        add = false;
                    }
                }
            }
            if (add) free.push(teacher);
        }
    }
    return free;
}

function timesIntersect(time1, time2) {
    if (time1['start_time'] + time1['duration'] > time2['start_time'] && time1['start_time'] + time1['duration'] <= time2['start_time'] + time2['start_time']) {
        return true;
    }

    else if (time1['start_time'] >= time2['start_time'] && time1['start_time'] < time2['start_time'] + time2['start_time']) {
        return true;
    }

    return false;
}

function teacherInSchedule(sched, id) {
    let times = [];
    for (let week in sched) {
        for (let time of week) {
            if (parseInt(time['teacher']) === id) {
                times.push(time);
            }
        }
    }
    return times;
}

window.onload = function() {
    doOnload();
    toast = new ToastComponent();
    getCourses();
    document.querySelector('#examCourseInput').addEventListener('input', autocompleteCourses);
    document.querySelector('#examCourseInput').addEventListener('input', () => {document.querySelector('#examCourseCodeInput').value = ""});
    document.querySelector('#examSearchButton').addEventListener('click', searchExam);
}