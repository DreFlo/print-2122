const { pyCall } = require("../_linkers/pyCall.js");

document.querySelector('#updateCourses').addEventListener('click', updateCourses);

function updateCourses() {
    pyCall("update_courses", "handleUpdateCourses", [])
}

function handleUpdateCourses() {
    
}