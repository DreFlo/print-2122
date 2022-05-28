document.querySelector('#updateCourses').addEventListener('click', updateCourses);
document.querySelector('#updateExams').addEventListener('click', updateExams);

let toast = new ToastComponent();

/* Update items */
function updateCourses() {
    pyCall("update_courses", "do_nothing", [])
}

function do_nothing() {}


module.exports(getCourses, getExams)