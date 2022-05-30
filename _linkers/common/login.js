/**
 * @file This file handles the user login.
 */ 

const loginButtonElement= document.getElementById("login");


if (loginButtonElement !== null)
    loginButtonElement.addEventListener('click', handleLogin);

const logoutButtonElement = document.querySelector("#logout");
if (logoutButtonElement !== null) {
    logoutButtonElement.addEventListener("click", logout);
}

/* Enter key */
var passwordEnter = document.getElementById("password");
if(passwordEnter != null) {
    passwordEnter.addEventListener("keypress", function(event){
        if(event.key === "Enter") {
            event.preventDefault();
            handleLogin();
        }
    });
}

// REQUESTING ------------------------------------------------

function handleLogin() {
    let login_username = document.getElementById("username").value;
    let login_password = document.getElementById("password").value;
    toast.show('Realizando login...', toastColor.GREEN);
    pyCall("login_page", "final_handleLogin", [login_username, login_password]);
}

function final_handleLogin(data) { 
    let toast = new ToastComponent(); 
    if (data['error'] === 'true') {
        setLogged('false');
        document.getElementById('username').value = "";
        document.getElementById('password').value = "";
        toast.show('Não possível realizar login', toastColor.GREEN);
    } else {
        setLogged(data["Name"]);
        checkLogin();
    }

}

// Login process
function checkLogin() {
    pyCall("login_check", "updateFileLogin");
}

function updateFileLogin(data) {
    if (data['Name'] === "NONE") setLogged('false');      //case the login input is wrong
    else setLogged(data['Name']);
    location.reload();
}

function logout() {
    setLogged('false');
    pyCall("logout", "checkLogin");
}





