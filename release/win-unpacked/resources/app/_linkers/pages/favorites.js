

let FileTypeCorres = {"docents": "Professor", "ucs": "UC", "students": "Estudante"}  
let TypeFileCorres = {"Professor": "docents", "UC": "ucs", "Estudante": "students"}
let toast = new ToastComponent(); 


document.addEventListener("DOMContentLoaded", () => {
    setCreateTableEvent(); 
    setAddFavoriteEvent(); 
    setRemoveFavoriteEvent();
}); 

// EVENTS ---------------------------------------------------------------------------------------------- 

function setCreateTableEvent(){
    let favoritesArray = getFavorites(); 
    createTable(favoritesArray); 
}

function setAddFavoriteEvent(){
    document.querySelector("#add-favorite").addEventListener("click", ()=> addFavorite());
}

function setRemoveFavoriteEvent(){ 
    // Needs to be done with jquery, due pagination.
    $('#table-wrapper-favorites tbody').on('click', '.btn-remove', e => removeFavorites(e));
} 


function validateInput(){
    let idElement = document.querySelector("#id"); 
    let nameElement = document.querySelector("#name"); 
    let acronymElement = document.querySelector("#acronym");   

    let typesArray = Array.prototype.slice.call(document.getElementsByName("type"));     
    let type = typesArray.filter(element => element.checked)[0].value;      // Can be "docents", "ucs" or "students"  

    let isValid = true; 

    if (idElement.value.trim() == ""){
        setInvalidInput(idElement, "Este campo deve ser preenchido");  
        isValid = false; 
    } else setValidInput(idElement); 

    if (nameElement.value.trim() == "") { 
        setInvalidInput(nameElement, "Este campo deve ser preenchido");  
        isValid = false; 
    } else setValidInput(nameElement);  
    
    if ((type == "docents" || type == "ucs") && acronymElement.value.trim() == "") {
        setInvalidInput(acronymElement, "Este campo deve ser preenchido"); 
        isValid = false; 
    }  else setValidInput(acronymElement);
 
    return isValid;
} 

// REQUESTING ----------------------------------------------------------------
/**
 * Adds a new favorite to the gui. 
 */
function addFavorite(){  
    if (!validateInput()) return;  

    let id = document.querySelector("#id").value;  
    let name = document.querySelector("#name").value; 
    let acronym = document.querySelector("#acronym").value;   
    // Gets array of the possible types. 
    let typesArray = Array.prototype.slice.call(document.getElementsByName("type"));   
    // Gets the value of the chosen type. 
    let type = typesArray.filter(element => element.checked)[0].value;      // Can be "docents", "ucs" or "students" 

    let fileContent = objectToArray(JSON.parse(readFavorites(type)));     
    let entity = newEntity(id, type, name, acronym); 
    fileContent.push(entity);  

    // Saving file. 
    let isSaved = saveFavorites(type, fileContent);   
    if (isSaved) { 
        toast.show("Registo salvo!", toastColor.GREEN);   
        addRowDataTable("#table-wrapper-favorites", [objectToArray(entity)]);   
        closeModal();
        clearModal(); 
    } else { 
        toast.show("Erro ao salvar registo...", toastColor.RED); 
    }
}   

function removeFavorites(event){
    let row = event.target.parentNode.parentNode;   
    let data = row.querySelectorAll("td");   
    let id = data[0].innerText; 
    let type = data[1].innerText;    

    let json = JSON.parse(readFavorites(TypeFileCorres[type])); 
    json = json.filter(element => element.id != id)  

    // Saving file. 
    let isSaved = saveFavorites(TypeFileCorres[type], json); 
    if (isSaved){
        toast.show("Registo removido com sucesso!", toastColor.GREEN);   
        let favorites = getFavorites();
        updateDataTable("#table-wrapper-favorites", favorites);
    } else {
        toast.show("Erro ao remover registo...", toastColor.RED);
    }
}   

// OTHER FUNCTIONS --------------------------------------------------------------------- 

function createTable(favoritesArray){ 
    $("#table-wrapper-favorites").dataTable({
        data: favoritesArray, 
        columns: [ 
            {title: "Up"},  
            {title: "Tipo"},
            {title: "Nome"},  
            {title: "Sigla"}, 
            {title: ""}
        ], 
        columnDefs: [{
            "defaultContent": "-",
            "targets": 3,
        }, 
        {
            "targets": -1, 
            "data": null, 
            "defaultContent": '<button type="button" class="btn btn-danger btn-remove">X</button>',
        },
        ]
    }); 
}  
/**
 * Get's all the favorites saved. 
 * @returns Matrix of favorites
 */
function getFavorites(){
    let students = jsonToArray(JSON.parse(readFavorites("students")));     
    let docents = jsonToArray(JSON.parse(readFavorites("docents")));   
    let ucs = jsonToArray(JSON.parse(readFavorites("ucs")));  
    return students.concat(docents, ucs); 

} 

function newEntity(id, type, name, acronym){ 
    return {
        "id": id,  
        "type": FileTypeCorres[type], 
        "name": name, 
        "acronym": acronym 
    }  
}

function clearModal(){
    let idElement = document.querySelector("#id"); 
    let nameElement = document.querySelector("#name"); 
    let acronymElement = document.querySelector("#acronym"); 

    idElement.value = ""; 
    nameElement.value = ""; 
    acronymElement.value = "";  

    idElement.classList.remove("is-valid");
    nameElement.classList.remove("is-valid"); 
    acronymElement.classList.remove("is-valid");   

    idElement.classList.remove("is-invalid");
    nameElement.classList.remove("is-invalid"); 
    acronymElement.classList.remove("is-invalid");  


} 

function closeModal(){
    let modal = new bootstrap.Modal(document.getElementById("add-favorite-modal")); 
    modal.hide();
}