import Core
import retrieve_schedule
import re
import requests
import json
import datetime
import os

cwd = os.getcwd()

data_file = os.path.join(cwd, 'resources\\app\\data\\schedules.json')

def get_all_dei_schedules():
    workers_list = get_dei_workers_list()

    f = open(data_file, "w", encoding="utf-8")
    total_info = {}
    total_info['updates'] = {
        'class_schedules': datetime.datetime.now().strftime("%d-%m-%Y"),
        'exam_schedules': datetime.datetime.now().strftime("%d-%m-%Y")
    }

    n = 40
    for worker in workers_list:
        if(n == 0): break
        n -= 1

        print("worker: %s " %(worker))
        name, sigla = Core.get_teacher_info(worker)
        
        class_schedule, due_to = retrieve_schedule.get_complete_schedule(str(worker), "2021")
        due_to_class = due_to.strftime("%d-%m-%Y")
        class_schedule_json = {'due_to': due_to_class, 'schedule': class_schedule}
        
        due_to_exams, exam_schedules = retrieve_schedule.get_vigilance_schedule(worker)
        exam_schedule_json = {'due_to': due_to_exams, 'schedule': exam_schedules}

        info = {
            "name": name,
            "sigla": sigla,
            "class_schedule": class_schedule_json,
            "exam_schedule": exam_schedule_json
        }

        total_info[worker] = info

    f.write(json.dumps(total_info, indent=4, ensure_ascii=False))
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

def get_vigilance_schedule():
    workers_list = [211625] #Com 1 vigilancia
    #workers_list = [353972] #Sem vigilancia

    #f = open(data_file, "r+", encoding="utf-8")
    #workers_info = json.loads(f.read())
    
    #print(json_object)

    for code in workers_list:
        due_to, schedules = retrieve_schedule.get_vigilance_schedule(code)
        #print(schedules)
        info = {
            "due_to": due_to,
            "schedule": schedules
        }
        #workers_info[str(code)]['exam_schedule'] = info
        print(info)
    
    '''json_object = json.dumps(workers_info, indent=4, ensure_ascii=False)
    f.seek(0)
    f.write(json_object)
    f.truncate()
    f.close()'''

        

        
def main():
    get_all_dei_schedules()
    
    #get_vigilance_schedule()

    '''
    try:

        # Return json setting no error. 
        json = BuildJson({})
        print(json.getJson())
        sys.stdout.flush()
    except: 
        json_obj = BuildJson()
        json_obj.setError()
        sys.stdout.flush()'''


main()