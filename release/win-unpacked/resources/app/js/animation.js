// Menu animation.
let buttonMenu = document.querySelector(".menu-toggle");
let menu = document.querySelector(".menu");

buttonMenu.addEventListener("click", ()=> {
    toggleClassActive(buttonMenu);
    toggleClassActive(menu);

});

function toggleClassActive(target) {
    let classList = target.classList;
    if (classList.contains("active")) classList.remove("active");
    else classList.add("active");
}

