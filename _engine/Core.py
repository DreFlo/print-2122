from datetime import datetime
from msilib.schema import tables
from numpy import double
import mechanize as mc
from bs4 import BeautifulSoup as bs
import Schedule as sc
import re
import collections
import Login
import pandas as pd
import requests
import json
from urllib.parse import urlparse
from urllib.parse import parse_qs


"""
This file contains some important and base functions used for many other files. 
"""


# GET HTML FUNCTIONS -------------------------------------------------------------------------

def get_html(br, url):
    page = br.open(url)
    return page.read()


def get_html_logged(url):
    """
    Get the html for a user that is logged
    :type url: str
    :param url: url to be accessed
    :return: hmtl of the url in string format
    """
    login = Login.Login()  # cookie is checked when object is created
    br = login.getBr()
    return get_html(br, url)


# STUDENT FUNCTIONS -------------------------------------------------------------------------

def get_student_URL(student_id):
    """
    Get the name of a student given its name
    :type student_id: str
    :param student_id: Student identification
    :return:
    """
    return "https://sigarra.up.pt/feup/pt/fest_geral.cursos_list?pv_num_unico=" + student_id


def get_bs_student(student_id):
    """
    Get's the beautiful soup of the student
    :param student_id:
    :return:
    """
    try:
        url = get_student_URL(student_id)
        html = get_html_logged(url)

        return bs(html)
    except:
        return None


def get_name_student(soup):
    """
    Get student name from the main student page
    
    :param soup: soup of the main page  
    :return: name of the student page 
    """

    divs = soup.findAll('div', attrs={'class': 'estudante-info-nome'})[0].text
    return str(divs).rstrip().lstrip()


def get_course_student(soup):
    """
    Get course of the student from the main page 
    
    :param soup: soup of the main student page  
    :return: student course name in string 
    """
    return soup.findAll("div", attrs={'class': "estudante-lista-curso-nome"})[0].find_all("a")[0].text


def get_acadm_course(student_id):
    """
    Gets the academic course page.
    :param student_id: Student identification.
    :return: Page beautiful soup
    """

    login = Login.Login()  # cookie is checked when object is created
    br = login.getBr()
    br.open(get_student_URL(student_id))

    links = br.links()
    for link in links:
        if (re.match(r"fest_geral\.curso_percurso_academico_view\?pv_fest_id=\d", link.url)):
            student_curr_url = link.url
            break

    student_curr_url.replace("curso_percurso_academico_view", "ucurr_inscricoes_list")
    response = br.open(student_curr_url)

    return bs(response.read())


def extract_simple_table(table):
    dfs = pd.read_html(str(table), flavor="bs4")
    return dfs[0]


def get_media(soup):
    return soup.find(text="Média:").parent.find_next_sibling("td").text


def get_curricular_unit_students(UC_code):
    '''
    Get all students in a curricular unit
    '''
    i = 1
    students = []
    # Go through all results pages
    while True:
        url = "https://sigarra.up.pt/feup/pt/fest_geral.estudantes_inscritos_list?pv_num_pag=" + str(i) +"&pv_ocorrencia_id=" + str(UC_code)

        html = get_html_logged(url)
        soup = bs(html)

        # When has gone through all results pages
        if soup.find(id="erro"):
            break
        
        for student_number in soup.find_all('td', {"class" : "k"}):
            students.append((student_number.text, student_number.next_sibling.next_sibling.text))

        i += 1

    return students

# TEACHER FUNCTIONS -------------------------------------------------------------------------

def get_links_schedules(teacher_id, year):
    """
    Get all links of the schedules that a professor will have in the semester
    :param teacher_id: The up teacher's up number
    :param year: Year of the schedule
    :return: list of links for the schedules
    """

    url = "https://sigarra.up.pt/feup/pt/hor_geral.docentes_view?pv_doc_codigo=" + str(teacher_id) + "&pv_ano_lectivo=" + str(year) + "&pv_periodos=1"
    html = get_html_logged(url)
    soup = bs(html)
    
    #a_tags = soup.find_all('table', {'class': 'horario-semanas ecra'})[0].find_all('a', href=True)

    table = soup.find_all('table', {'class': 'horario-semanas ecra'})

    # Either no schedule or no separation of weeks
    if(len(table) == 0):
        table = soup.find_all('table', {'class': 'horario'})

        if(len(table) == 0): # No schedule
            links_schedule = []
        else: # No separation of weeks
            links_schedule = [url]
        
        return links_schedule, soup

    a_tags = table[0].find_all('a', href=True)
    links_schedule = []

    for i in range(len(a_tags)):
        links_schedule.append("https://sigarra.up.pt/feup/pt/" + a_tags[i]['href'])
    return links_schedule, soup


def get_teacher_name_schedule(soup):
    """
    Get the name of the teacher in the time table
    :param soup: Beautiful soup formated html page
    :return: name
    """
    return soup.findAll('div', attrs={'id': 'conteudoinner'})[0].findAll('h1')[1].text.split("Horário de ")[1]


def get_teacher_schedule_html(teacher_id, year, url=None):
    """
    Gets the teacher's html schedule table
    :type teacher_id: str
    :param teacher_id: Teacher identification

    :type year: str
    :param year: Year of the schedule to be consulted

    :type url: str
    :param url: Case the schedule is in a specific link, the optional field must be filled

    :return: table
    """

    if url is None:
        url = "https://sigarra.up.pt/feup/pt/hor_geral.docentes_view?pv_doc_codigo=" + teacher_id + "&pv_ano_lectivo=" + year

    html = get_html_logged(url)
    soup = bs(html)

    # get the table
    htmlTable = soup.find_all('table', {"class": "horario"})[0]
    week_range = soup.find_all('h3')[0].text[11:].replace('a', '')

    return htmlTable, week_range

# Get the name and sigla of a teacher
def get_teacher_info(teacher_id):
    url = "https://sigarra.up.pt/feup/pt/FUNC_GERAL.FORMVIEW?P_CODIGO=" + str(teacher_id)
    
    html = get_html_logged(url)
    soup = bs(html)

    name = soup.find_all('table', {"class": "tabelasz"})[0].findAll('tr')[0].findAll('td')[1].findAll('b')[0].text
    sigla = soup.find_all('table', {"class": "tabelasz"})[0].findAll('tr')[1].findAll('td')[1].findAll('b')[0].text
    return name, sigla


# TODO: redo this 
def HTMLtable2Sched(trs_list):
    """
    Extracts the schedule from a html table and return the format described in: https://github.com/Jumaruba/guiSigtools/wiki/Schedule-retrieve
    :param trs_list: All the tags tr of the table
    :return: A schedule class
    """
    sched = sc.Schedule()
    for trs in trs_list:
        td = trs.find_all('td')
        weekCounter = -1
        for i in range(len(td)):
            if td[i].text.strip() != "" and i != 0 and re.match(r'[a-zA-Z0-9_\s]*\([a-zA-Z0-9_]*\)', td[i].text):
                spec = handleSpecification(td[i].text.split())  # transform the specification into a dictionary
                hour = float(td[0].text[0:2])  # get the hour the class has started
                if td[0].text[3] == '3':
                    hour += 0.5
                hour = sc.Hour(weekCounter, hour, int(td[i]['rowspan']) * 30, spec)
                sched.add_time(hour)

            weekCounter += 1
    return sched


def handleSpecification(spec):
    output = collections.defaultdict(list)
    output['aula'] = spec[0]
    output['tipo'] = spec[1]
    output['turma'] = spec[2]
    output['sala'] = spec[3]
    for i in range(4, len(spec)):
        output['professores'].append(spec[i])

    return output

# UC FUNCTIONS

def get_variable_from_url(url, requestField):
    """
    Get a request from a url and return the value
    :type url: str
    :param url: Url with a request

    :type requestField: str
    :param requestField: Request with a value

    :return: Value form request
    """
    parsed_url = urlparse(url)
    return parse_qs(parsed_url.query)[requestField][0]

def get_UC_from_query(UCCode, year):
    '''
    Get UC from code and year
    :returns: List of lists with UC name, code, year and id
    '''
    results = []
    page_number = 1

    # Iterate through results pages
    while True:
        url = 'https://sigarra.up.pt/feup/pt/UCURR_GERAL.PESQUISA_OCORR_UCS_LIST?pv_num_pag=' + str(page_number) + '&pv_ano_lectivo=' + str(year) + '&pv_uc_codigo=' + str(UCCode)

        html = get_html(mc.Browser(),url)
        soup = bs(html)

        # When has gone through all results pages
        if soup.find(id="erro"):
            break

        for row in soup.find_all('tr', {'class' : 'd'}):
            elems = row.find_all('td')
            result = [  
                    elems[0].text,
                    elems[1].text,
                    elems[2].text,
                    get_variable_from_url(elems[2].find('a')['href'], 'pv_ocorrencia_id')
                    ]
            results.append(result)

        page_number += 1

    return results

def get_courses():
    """
    Get all courses from Feup
    :return: Dictionary with name and code of every course to update json
    """
    url = 'https://sigarra.up.pt/feup/pt/cur_geral.cur_inicio'

    html = get_html(mc.Browser(),url)
    soup = bs(html)

    if soup.find(id="erro"):
        return None

    results = {"courses" : []}

    ulT = [soup.find("ul", {"id": "L_a"}), soup.find("ul", {"id": "M_a"}), soup.find("ul", {"id": "D_a"})]

    for ul in ulT:
        liT = ul.find_all('li')
        for li in liT:
            aT = li.find('a')
            results["courses"].append({"name" : aT.text, "code": get_variable_from_url(aT['href'], 'pv_curso_id')})

    return results

        
def get_course_UCs(course_id, year):
    '''
    Get all UCs for a course
    :returns: List of tuple-3's with UC period, code, and link
    '''
    UCs = []
    page_number = 1
    while True:
        url = 'https://sigarra.up.pt/feup/pt/UCURR_GERAL.PESQUISA_OCORR_UCS_LIST?pv_num_pag=' + str(page_number) + '&pv_ano_lectivo=' + str(year) + '&pv_curso_id=' + str(course_id)

        html = get_html(mc.Browser(),url)
        soup = bs(html, features="html5lib")

        if soup.find(id="erro"):
            break

        for row in soup.find_all('tr', {'class' : 'd'}):
            elems = row.find_all('td')
            UCs.append((elems[0].text, elems[1].text, 'https://sigarra.up.pt/feup/pt/' + elems[2].find('a')['href']))

        page_number += 1

    return UCs

def extract_teacher_code(link):
    return int(link.replace('func_geral.formview?p_codigo=', ''))

def string_to_float(str):
    halves = str.split(',')
    return float('.'.join(halves))

def get_UC_teacher_info(UC):
    '''
    Get all techer information for UC
    :returns: Dictionary with UC name, period, code, id and teacher info where teacher info is a dictionary with diferent class types (theoretical, practical, lab, and other)
    with total time, fulfulled time and an array with the attributed teachers 
    '''
    period = UC[0]
    code = UC[1]
    url = UC[2]

    info = { 
                'theoretical' : {
                    'total' : None,
                    'fulfilled' : 0,
                    'teachers' : []
                },
                'practical' : {
                    'total' : None,
                    'fulfilled' : 0,
                    'teachers' : []
                },
                'laboratorial' : {
                    'total' : None,
                    'fulfilled' : 0,
                    'teachers' : []
                },
                'other' : {
                    'total' : None,
                    'fulfilled' : 0,
                    'teachers' : []
                }
            }

    html = get_html(mc.Browser(), url)
    soup = bs(html, features="html5lib")

    id = get_variable_from_url(url, 'pv_ocorrencia_id')

    name = soup.find_all('h1')[1].text

    div = soup.find('div', {'class': 'horas'})

    if div == None:
        tables = soup.find_all('table', {'class': 'dados'})
        if len(tables) >= 3:
            table = tables[2]
        else:
            return {'name' : name, 'period': period, 'code': code,  'id' : id, 'info' : info}
    else:
        table = div.find('table', {'class' : 'dados'})

    type = None

    # For each row in teacher information table
    if table != None:
        for row in table.find_all('tr', {'class': 'd'}):
            # Switch current class type
            if row.find('td', {'class' : 'k'}):
                title = row.find_all('td', {'class': 'k'})[0].find('a').text
                if  title == 'Teóricas' or title == 'Teórica':
                    type = 'theoretical'
                elif title == 'Teórico-Práticas' or title == 'Teórico-Prática':
                    type = 'practical'
                elif title == 'Práticas Laboratoriais':
                    type = 'laboratorial'
                else:
                    type = 'other'
                info[type]['total'] = string_to_float(row.find_all('td', {'class' : 'n'})[-1].text)
            #Add new teacher
            else:
                teacher = {
                    'name' : row.find('td', {'class' : 't'}).text,
                    'code' : extract_teacher_code(row.find('td', {'class' : 't'}).find('a')['href']) if row.find('td', {'class' : 't'}).find('a') else None,
                    'hours' : string_to_float(row.find('td', {'class' : 'n'}).text),
                    'underContract' : True,
                    'contractStart' : None
                }
                info[type]['fulfilled'] += teacher['hours']
                info[type]['teachers'].append(teacher)

    return {'name' : name, 'period': period, 'code': code, 'id' : id, 'info' : info}

def get_exams(course):
    '''
    Get exams for a given course
    '''
    exams = []
    url = "https://sigarra.up.pt/feup/pt/exa_geral.mapa_de_exames?p_curso_id=" + course

    html = get_html(mc.Browser(),url)
    soup = bs(html)

    if soup.find(id="erro"):
        return {"exams": exams}

    conteudo_inner = soup.find("div", {"id": "conteudoinner"})
    
    h3_soup = conteudo_inner.find_all("h3")
    table_soup = conteudo_inner.find_all("table", recursive=False)

    for i in range(len(h3_soup)):
        
        # Get all relevant tables in table

        child = table_soup[i].findChild().findChild()
        for table_week in child.find_all("table", recursive=False):
            days_tr = table_week.find_all("th")
            exams_tr = table_week.find_all("td", {"class": "l k", "valign": "top"})
            
            for index in range(len(days_tr)):
                child = exams_tr[index].findChild()
                if child.name == "p":
                    continue
                
                exam_td = child.find_all("td")
                for td in exam_td:
                    exam = {}
                    exam["type"] = h3_soup[i].text
                    exam["course"] = course
                    exam["uc"] = td.find("a").find("b").text
                    exam["date"] = days_tr[index].find("span").text
                    
                    hour = td.text
                    for h in range(len(hour)):
                        if hour[h].isdigit() and hour[h+2]==":":
                            hour = hour[h:h+11]
                            break
                    exam["hour"] = hour
                    exam['href'] = td.find("a")['href']

                    rooms = []
                    td_span_rooms = td.find("span")
                    for span_room in td_span_rooms:
                        if(span_room.string != ", "):
                            rooms.append(span_room.string)

                    exam["rooms"] = rooms

                    exams.append(exam)

    return exams

def get_with_exam_teachers_and_time(exam):
    '''
    Get teachers, start time, and duration 
    '''
    exam['teachers'] = []

    url = 'https://sigarra.up.pt/feup/pt/' + exam['href']

    html = get_html(mc.Browser(),url)
    soup = bs(html)

    inTeachers = False
    inStart = False
    inDuration = False

    for td in soup.find("table").find_all("td"):
        if td.string == "Vigilantes:":
            inTeachers = True
            inDuration = False
            inStart = False
            continue
        elif td.string == "Hora Início:":
            inTeachers = False
            inDuration = False
            inStart = True
            continue
        elif td.string == "Duração:":
            inTeachers = False
            inDuration = True
            inStart = False
            continue

        if inTeachers:
            for a in td.find_all("a"):
                exam['teachers'].append(extract_teacher_code(a['href']))
            inTeachers = False
            continue
        elif inStart:
            start_string = td.string
            start_split = start_string.split(':')
            exam['start_time'] = int(start_split[0]) + (int(start_split[1]) / 60)
            inStart = False
            continue
        elif inDuration:
            duration_string = td.string
            duration_split = duration_string.split(':')
            exam['duration'] = int(duration_split[0]) + (int(duration_split[1]) / 60)
            inDuration = False
            continue
    
    exam['day'] = datetime.strptime(exam['date'], '%Y-%m-%d').weekday()

    return exam
    
def get_rooms(bulding_number):
    '''
    Get room list for a given building
    '''
    room_links = []

    pag_n = 1

    while True:
        url = 'https://sigarra.up.pt/feup/pt/instal_geral.espaco_list?pv_num_pag=' + str(pag_n) + '&pv_edificio_id=' + str(bulding_number) + '&pv_activo=S'

        html = get_html(mc.Browser(), url) 
        soup = bs(html, features="html5lib")

        if soup.find(id="erro"):
            break

        table = soup.find('table', {'class' : 'dados'})

        first = True

        for row in table.find_all('tr'):
            if first:
                first = False
                continue
            elem = row.find('td').find('a')

            room_links.append('https://sigarra.up.pt/feup/pt/' + elem['href'])

        pag_n += 1

    return room_links

def get_room_info(room_url):
    '''
    Get room information from url
    '''
    html = get_html(mc.Browser(), room_url) 
    soup = bs(html, features="html5lib")

    room_info = {"code" : soup.find_all('h1')[1].text, "cap" : None}

    form_labels = soup.find_all('div', 'form-etiqueta')

    found = False

    for label in form_labels:
        if label.text == 'Capacidade Exame:':
            found = True
            room_info['cap'] = int(label.find_next_sibling('div', {'class': 'form-campo'}).text)
            break
        elif label.text == 'Número de Computadores:':
            found = True
            room_info['cap'] = int(label.find_next_sibling('div', {'class': 'form-campo'}).text)
        elif label.text == 'Capacidade Aulas:':
            found = True
            if room_info['cap'] == None:
                room_info['cap'] = int(label.find_next_sibling('div', {'class': 'form-campo'}).text)
            
    return room_info if found else None
