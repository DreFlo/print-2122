document.querySelector('#updateCourses').addEventListener('click', updateCourses);

/* Update items */
function updateCourses() {
    pyCall("update_courses", "do_nothing", [])
}

function do_nothing() {}


module.exports(updateCourses)