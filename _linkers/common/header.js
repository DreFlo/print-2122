//const { getLogged } = require("./checkLogin");

let body = document.querySelector("body");


let header = '<nav class="navbar navbar-expand-lg navbar-dark bg-dark text-white w-100" style="position: fixed; z-index: 2">\n' +
    '  <div class="container-fluid">\n' +
    '    <a class="navbar-brand" href="#">SigTools</a>\n' +
    '    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">\n' +
    '      <span class="navbar-toggler-icon"></span>\n' +
    '    </button>\n' +
    '\n' +
    '    <div class="collapse navbar-collapse" id="navbarColor01">\n' +
    '      <ul class="navbar-nav me-auto">\n' +
    '        <li class="nav-item">\n' +
    '          <a class="nav-link active" href="../index.html">Home\n' +
    '            <span class="visually-hidden">(current)</span>\n' +
    '          </a>\n' +
    '        </li>\n' +
    '        <li class="nav-item dropdown">\n' +
    '          <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Pesquisa</a>\n' +
    '          <div class="dropdown-menu">\n' +
    '            <a class="dropdown-item" href="../_views/search_student.html">Estudantes</a>\n' +
    '            <a class="dropdown-item" href="../_views/search_teacher_theses.html">Teses</a>\n' +
    '            <div class="dropdown-divider"></div>\n' +
    '            <a class="dropdown-item" href="../_views/search_teacher_schedule.html">Horários de docentes</a>\n' +
    '          </div>\n' +
    '        </li>\n' +
    '        <li class="nav-item">\n' +
    '          <a class="nav-link" href="../_views/favorite.html">Favoritos</a>\n' +
    '        </li>\n' +
    '        </li>\n' +
    '        <li class="nav-item dropdown">\n' +
    '          <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Conflitos</a>\n' +
    '          <div class="dropdown-menu">\n' +
    '            <a class="dropdown-item" href="../_views/mass_schedule_conflicts.html">Conflito de Horários de Docentes</a>\n' +
    '            <a class="dropdown-item" href="../_views/student_uc_conflicts.html">Sobreposição de Alunos entre Unidades Curriculares</a>\n' +
    '          </div>\n' +
    '        <li class="nav-item dropdown">\n' +
    '          <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Atribuições</a>\n' +
    '          <div class="dropdown-menu">\n' +
    '            <a class="dropdown-item" href="../_views/ucs_missing_teachers_table.html">Atribuição de Docentes a Unidades Curriculares</a>\n' +
    '            <a class="dropdown-item" href="../_views/assign_teachers_to_exams.html">Atribuição de Docentes a Vigilâncias de Exames</a>\n' +
    '          </div>\n' +
    '        <li class="nav-item">\n' +
    '          <a class="nav-link" href="../_views/settings.html">Configurações</a>\n' +
    '        </li>\n' +
    '      </ul>\n';


const loginForm = '<form class="d-flex">\n \
                   <div class="mx-2">\
                        <input type="text" class="form-control" aria-describedby="username" id="username" placeholder="Utilizador">\
                    </div> \
                    <div class="mx-2">\
                        <input type="password" class="form-control" id="password" placeholder="Senha">\
                    </div> \
                    <button type="button" id="login" class="btn btn-primary">Submit</button> \
            </form>\
            </li>\
            </ul>\
            </nav> \
            ';

const logoutButton = '<button class="btn text-white" id="logout" aria-expanded="false">\
                    <span>Logout</span>\
                </button></li></ul></nav>';

let username_div = "<div>" + getLogged() + "</div>";

if (getLogged() !== "false") header += username_div + logoutButton;
else header += loginForm;
body.innerHTML = header + body.innerHTML;
