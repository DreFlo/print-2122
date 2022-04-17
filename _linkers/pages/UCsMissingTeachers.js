const { pyCall } = require("../_linkers/pyCall.js");

let toast = new ToastComponent();

document.querySelector('#BUTS').addEventListener('click', createNewTable);

function createNewTable() {
    console.log('Pressed');
    pyCall("retrieve_course_uc_teachers_info", "handleUCResponse", []);
}

function handleUCResponse(data) {
    console.log(data['huh']);
}