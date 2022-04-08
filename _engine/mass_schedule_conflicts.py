import Core
import sys 
from bs4 import BeautifulSoup as bs
import json 
import re
from datetime import date
from handle_json import BuildJson


# Gets schedules of all DEI workers and saves them
def get_all_dei_schedules():
    #name, sigla = Core.get_teacher_info(231081)
    list = get_dei_workers_list()
    f = open('./data/test.json', "w")
    f.write("before\n")
    
    n = 0
    total_info = {}
    for worker in list:
        name, sigla = Core.get_teacher_info(worker)
        info = {
            "name": name,
            "sigla": sigla
        }
        total_info[worker] = info
        if(n > 3):
            break
        n += 1
    f.write(json.dumps(total_info))
    f.write("\nafter")
    f.close()

def get_dei_workers_list():
    f = open('./data/workers_dei_codes.txt', 'r')

    workers_list = [line.rstrip() for line in f]
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