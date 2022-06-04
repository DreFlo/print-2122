from flask import render_template
import Core
from handle_json import BuildJson
import retrieve_schedule
import re
import requests
import json
import datetime
import os
import sys
import ast

cwd = os.getcwd()

data_file = os.path.join(cwd, 'resources\\app\\data\\schedules.json')

def get_regular():
    return sys.argv[1]

def get_exams(): 
    return sys.argv[2]

def get_year():
    return sys.argv[3]

# Receives string in format '[code, code]' and returns a list like [code, code]
def get_workers():
    list = ast.literal_eval(sys.argv[4])
    if(type(list) == int):
        return [str(list)]
    return [str(n) for n in list]


# Gets the schedules, both vigilance and class schedules, and stores them in the correct file
def get_all_dei_schedules(regular, exams, year, workers):
    if(len(workers) == 0):
        workers_list = get_dei_workers_list()
    else:
        workers_list = workers

    if(os.path.exists(data_file)):
        f = open(data_file, "r+", encoding="utf-8")
    else:
        f = open(data_file, "w+", encoding="utf-8")
    
    if(os.path.getsize(data_file) == 0):
        total_info = {}
    else:
        total_info = json.loads(f.read())
        
    if('updates' not in total_info.keys()):
        if(regular and not exams):
            total_info['updates'] = {
                'class_schedules': datetime.datetime.now().strftime("%d-%m-%Y"),
                'exam_schedules': ""
            }
        elif(exams and not regular):
            total_info['updates'] = {
                'class_schedules': "",
                'exam_schedules': datetime.datetime.now().strftime("%d-%m-%Y")
            }
        else:
             total_info['updates'] = {
                'class_schedules': datetime.datetime.now().strftime("%d-%m-%Y"),
                'exam_schedules': datetime.datetime.now().strftime("%d-%m-%Y")
            }
    else:
        if(regular):
            total_info['updates']['class_schedules'] = datetime.datetime.now().strftime("%d-%m-%Y")
        if(exams):
            total_info['updates']['exam_schedules'] = datetime.datetime.now().strftime("%d-%m-%Y")

    for worker in workers_list:
        name, sigla = Core.get_teacher_info(worker)
        
        if(regular):
            class_schedule, due_to = retrieve_schedule.get_complete_schedule(str(worker), year)
            due_to_class = due_to.strftime("%d-%m-%Y")
            class_schedule_info = {'due_to': due_to_class, 'schedule': class_schedule}
        
        if(exams):
            due_to_exams, exam_schedules = retrieve_schedule.get_vigilance_schedule(worker)
            exam_schedule_info = {'due_to': due_to_exams, 'schedule': exam_schedules}

        if(regular and not exams):
            if(worker not in total_info.keys()):
                exam_schedule_info = {'due_to': datetime.datetime.now().strftime("%d-%m-%Y"), 'schedule': []}
            else:
                exam_schedule_info = total_info[worker]['exam_schedule']

            total_info[worker] = {
                'name': name,
                'sigla': sigla,
                'class_schedule': class_schedule_info,
                'exam_schedule': exam_schedule_info
            }
        elif(exams and not regular):
            if(worker not in total_info.keys()):
                class_schedule_info = {'due_to': datetime.datetime.now().strftime("%d-%m-%Y"), 'schedule': []}
            else:
                class_schedule_info = total_info[worker]['exam_schedule']
                
            total_info[worker] = {
                'name': name,
                'sigla': sigla,
                'class_schedule': class_schedule_info,
                'exam_schedule': exam_schedule_info
            }
        else:
            total_info[worker] = {
                'name': name,
                'sigla': sigla,
                'class_schedule': class_schedule_info,
                'exam_schedule': exam_schedule_info
            }

    json_object = json.dumps(total_info, indent=4, ensure_ascii=False)
    f.seek(0)
    f.write(json_object)
    f.truncate()
    f.close()

# Gets a list wtih the codes of all DEI workers from sigarra
def get_dei_workers_list():
    response = requests.post('https://sigarra.up.pt/feup/pt/func_geral.QueryList', 
                    data={
                        'pv_unidade_nome' : 'Departamento de Engenharia InformÃ¡tica',
                        'p_n_registos' : '1000',
                        'p_unidade' : '151',
                        'P_NOME' : '',
                        'P_CODIGO' : '',
                        'P_SIGLA' : '',
                        'p_nivel' : '',
                        'pn_grupo' : '',
                        'pn_carreira' : '',
                        'pn_area' : '',
                        'pn_categoria': '',
                        'pv_categoria_nome' : '',
                        'pv_provimento' : '',
                        'pv_orgao' : '',
                        'pv_cargo' : '',
                        'P_ESTADO' : '',
                        'p_sala' : '',
                        'pv_sala_desc' : '',
                        'P_TELEFONE' : '',
                        'P_EMAIL' : '',
                        'p_area_id' : '',
                        'p_area' : ''
                    })

    content = str(response.content)
    pos = content.find("<h1>")
    new_content = content[pos:]
    list = new_content.split("<li>")
    workers_list = []

    for i in range(1, len(list)):
        m = re.search('(?<=CODIGO=)\d+', list[i])
        workers_list.append(m.group(0))
    return workers_list
         
def main():
    try:
        get_all_dei_schedules(get_regular(), get_exams(), get_year(), get_workers())
        
        # Return json setting no error. 
        json = BuildJson({})
        print(json.getJson())
        sys.stdout.flush()
    except: 
        json_obj = BuildJson({})
        json_obj.setError()
        print(json_obj.getJson())
        sys.stdout.flush()
    
main()