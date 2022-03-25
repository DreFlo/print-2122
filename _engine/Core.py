import mechanize as mc
from bs4 import BeautifulSoup as bs
import Schedule as sc
import re
import collections
import Login
import pandas as pd

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


# TEACHER FUNCTIONS -------------------------------------------------------------------------

def get_links_schedules(teacher_id, year):
    """
    Get all links of the schedules that a professor will have in the semester
    :param teacher_id: The up teacher's up number
    :param year: Year of the schedule
    :return: list of links for the schedules
    """

    url = "https://sigarra.up.pt/feup/pt/hor_geral.docentes_view?pv_doc_codigo=" + teacher_id + "&pv_ano_lectivo=" + year + "&pv_periodos=1"
    html = get_html_logged(url)
    soup = bs(html)
    a_tags = soup.find_all('table', {'class': 'horario-semanas ecra'})[0].find_all('a', href=True)
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
