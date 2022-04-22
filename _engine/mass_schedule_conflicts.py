import Core
import retrieve_schedule
import re
import requests
import json

# Gets schedules of all DEI workers and saves them
def get_all_dei_schedules():
    workers_list = get_dei_workers_list()

    # FOR TESTING
    # workers_list = [231081, 637045, 655498]
    # workers_list = [231081, 655498]
    # workers_list = [211625]
    # workers_list = [637045]
    # workers_list = [677168]

    # TO DO - Change file name to final one
    f = open('./data/test.json', "w", encoding="utf-8")
    total_info = {}

    n = 20
    for worker in workers_list:
        if(n == 0): break
        n -= 1

        print("worker: %s " %(worker))
        name, sigla = Core.get_teacher_info(worker)
        
        class_schedule, due_to = retrieve_schedule.get_complete_schedule(str(worker), "2021")
        due_to = due_to.strftime("%d-%m-%Y")
        class_schedule_json = {'due_to': due_to, 'schedule': class_schedule}
        
        # TO DO - Horário de vigilâncias

        info = {
            "name": name,
            "sigla": sigla,
            "class_schedule": class_schedule_json
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

        
        ''' GET THE NAME
        pos = list[i].find(">")
        new_str = list[i][pos+1:]
        end_pos = new_str.find("<")
        fin_str = new_str[:end_pos]
        print("WORDS: ", end=" ")
        print(fin_str)
        ''' 

    return workers_list

def main():
    get_all_dei_schedules()

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