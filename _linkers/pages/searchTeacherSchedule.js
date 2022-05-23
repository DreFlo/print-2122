/**
 * File responsible for manage the teacher schedule.
 * Case the user asks for a professor schedule, than the input will be treated here, then the python function will be
 * called.
 */

const {pyCall} = require("../_linkers/pyCall.js"); 
const {eventSelectFavorite} = require("../_linkers/common/selectFavorite"); 
const { TimeFrame } = require("../_linkers/utils/TimeFrame.js");
const { ScheduleTable } = require("../_linkers/components/ScheduleTable.js");

let docentCode, academicYear; 
let toast = new ToastComponent();    

let favoritesDict = jsonToArray(JSON.parse(readFavorites("docents")))
$('#table-wrapper-favorites').DataTable({
    data: favoritesDict,
    columns: [
        {title: 'Código'},
        {title: 'Tipo'}, 
        {title: 'Nome'}, 
        {title: 'Sigla'}, 
    ], 
    "columnDefs": [
        {
            "targets": [ 1 ],
            "visible": false,
            "searchable": false
        },
    ]
});
eventSelectFavorite(); 


function validateInput(){
    let docentCodeElement = document.querySelector("#code"); 
    let academicYearElement = document.querySelector("#academic-year"); 

    let isValid = true; 

    if (docentCodeElement.value.trim() == ""){
        setInvalidInput(docentCodeElement, "Este campo deve ser preenchido.");   
        isValid = false; 
    } else setValidInput(docentCodeElement); 

    if (academicYearElement.value.trim() == "") {
        setInvalidInput(academicYearElement, "Este campo deve ser preenchido.");   
        isValid = false; 
    } else setValidInput(academicYearElement); 

    return isValid; 
}   


// REQUESTING ---------------------------------------------------------------- 

document.querySelector("button[type=submit]").addEventListener("click", (event) => handleTeacherSched(event)); 

function handleTeacherSched(e){  
  e.preventDefault();
  if(!validateInput()) return;  
  document.querySelector(".scheds").innerHTML = "";
  docentCode = document.querySelector("#code").value.trim(); 
  academicYear = document.querySelector("#academic-year").value.trim();  

  toast.show("Atualizando horários...", toastColor.BLUE, false);
  pyCall("retrieve_schedule", "final_handleTeacherSched", [docentCode, academicYear]); 
} 

const matrixValue = (matrixCell, hourIndex, startHourIndex, schedule) => { 
    if (hourIndex === startHourIndex) return schedule;  
    return 'x'; 
}  

const buildTd = (data) => { 
  let tdElement = document.createElement("td"); 
  if (data == "" || data == undefined) return tdElement; 

  // Title - <div title=class name> <a href=link> class acronym</a> <span> (lesson type) </span> </div> 
  let classNameElement = document.createElement("div");   
  let classLinkElement = document.createElement("a");  
  classLinkElement.href = "https://sigarra.up.pt/feup/pt/" + data.link; 
  classLinkElement.innerText = data.class_name; 
  classNameElement.appendChild(classLinkElement);     

  let lessonTypeElement = document.createElement("span"); 
  lessonTypeElement.innerText = " (" + data.lesson_type + ")";  
  classNameElement.appendChild(lessonTypeElement); 

  // Choose color to td 
  if (data.lesson_type === "TP") tdElement.classList.add("blue"); 
  else if (data.lesson_type === "PL") tdElement.classList.add("green");  
  else if (data.lesson_type === "TE") tdElement.classList.add("yellow");  

  classNameElement.classList.add("text-center");
  classNameElement.title = data.name;   


  // location   
  let locationElement = document.createElement("div"); 
  locationElement.classList.add("text-center");
  locationElement.classList.add("mt-3");
  locationElement.innerText = data.location; 

  tdElement.appendChild(classNameElement);   
  tdElement.appendChild(locationElement);
  tdElement.rowSpan = data.duration * 2; 
  return tdElement;

} 

function final_handleTeacherSched(data){
    if (data.error === "true") { 
        toast.show("Não foi possível processar dados", toastColor.RED); 
    }
    else { 
        toast.show("Dados atualizados!", toastColor.GREEN);  
        let groupedByDate = groupByDate(); 
        let Table = new ScheduleTable(groupedByDate, matrixValue, buildTd); 
        Table.show();
    }
}  


function groupByDate(){ 
    
    let groupedScheds = {}
    let scheduleJson = JSON.parse(readSchedule());   
    
    console.log(scheduleJson);

    scheduleJson[docentCode]['class_schedule']['schedule'].forEach(sched => {      
      let currTimeFrame = new TimeFrame(stringToDate_ddmmyyyy(sched.start_date), stringToDate_ddmmyyyy(sched.end_date));  
      sched['teacher'] = docentCode; 
      let key = currTimeFrame.toString(); 
      if (groupedScheds.hasOwnProperty(key))  groupedScheds[key].push(sched);
      else groupedScheds[key] = [sched]; 
    });   

    return groupedScheds;
}




module.exports = { final_handleTeacherSched };
