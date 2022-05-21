const { getS3LikeProviderBaseUrl } = require("builder-util-runtime");
const { pyCall } = require("../_linkers/pyCall.js");

document.querySelector('#updateCourses').addEventListener('click', updateCourses);
document.querySelector('#getExams').addEventListener('click', updateExams);

let courses_json = require('../data/courses.json');
let exams_json = require('../data/exams.json');
let courses;
let exams;

/* Update items */
function updateCourses() {
    pyCall("update_courses", "handleUpdateCourses", [])
}

function handleUpdateCourses() {}

function updateExams() {
    pyCall("get_exams", "handleUpdateExams", [courses]);
}

function handleUpdateExams() {}


/* Get items */

function getCourses() {
    courses = courses_json["courses"];
}

function getExams() {
    exams = exams_json["exams"];
}

module.exports(getCourses, getExams)