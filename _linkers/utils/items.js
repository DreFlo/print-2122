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

function do_nothing() {}


module.exports(getCourses, getExams)