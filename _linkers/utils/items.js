const { pyCall } = require("../_linkers/pyCall.js");

document.querySelector('#updateCourses').addEventListener('click', updateCourses);
document.querySelector('#updateExams').addEventListener('click', updateExams);

let toast = new ToastComponent();
let courses_json = require('../data/courses.json');
let exams_json = require('../data/exams.json');

/* Update items */
function updateCourses() {
    pyCall("update_courses", "do_nothing", [])
}

function updateExams() {
    pyCall("update_exams", "do_nothing", []);
}

function do_nothing() {}


/* Get items */

function getCourses() {
    return courses_json["courses"];
}

function getExams() {
    return exams_json["exams"];
}

module.exports(getCourses, getExams)