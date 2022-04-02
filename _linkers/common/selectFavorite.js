let selectedFavorites = [];

/**
 * Selects a student from the favorite list.
 */
function eventSelectFavorite(){
    let favoriteElement = document.querySelectorAll("#insertFavorite tr");
    for (let i = 1 ; i < favoriteElement.length; i++)
        favoriteElement[i].addEventListener("click", (e)=>{
            let trElement = e.target.parentNode;
            let upNumber = trElement.childNodes[0].innerText;
            toggleSelected(upNumber, trElement);
        });

    let saveButton = document.querySelector("#saveFavorite");
    saveButton.addEventListener("click", addToInput);

    let closeButton = document.querySelector("#closeFavorite");
    closeButton.addEventListener("click", resetSelected);
}

/**
 * Adds the selected favorite to the input.
 */
function addToInput(){
    let inputLine = document.getElementById("code");
    inputLine.value = selectedFavorites.join(" ");
}

/**
 * Mark the row as selected.
 * @param element - The element that will be added to the input line.
 * @param trElement - Row selected.
 */
function toggleSelected(element, trElement){
    if (selectedFavorites.includes(element)) {
        selectedFavorites.splice(selectedFavorites.indexOf(element), 1);
        trElement.classList.remove("selected");
    }
    else {
        selectedFavorites.push(element);
        trElement.classList.add("selected");
    }
}

function resetSelected(){
    let selectElements = document.querySelectorAll("#insertFavorite tr");
    selectElements.forEach((element)=>{
        element.classList.remove("selected");
    });
    selectedFavorites = [];
}

module.exports = {eventSelectFavorite};