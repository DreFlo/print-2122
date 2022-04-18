const { pyCall } = require("../_linkers/pyCall.js");

let toast = new ToastComponent();
let tables;

document.querySelector('#BUTS').addEventListener('click', createNewTable);

function createNewTable() {
    console.log('Pressed');
    pyCall("retrieve_course_uc_teachers_info", "handleCreateNewTableResponse", ['table_001', 22841, 2021]);
}

function handleCreateNewTableResponse(data) {
    console.log("Done");
    tables = JSON.parse(data);
    console.log(tables);
}

function getTables() {
    pyCall("get_uc_teacher_tables", "handleGetTablesResponse", []);
}

function handleGetTablesResponse() {
    tables = JSON.parse(data);
}

function buildTable(tableName) {

}