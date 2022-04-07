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
    list = Core.get_dei_workers()
    f = open('./data/test.txt', "w")
    f.write("before\n")
    f.write(str(list))
    f.write("\nafter")
    f.close()

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