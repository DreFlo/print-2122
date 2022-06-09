import Core
from handle_json import BuildJson
import retrieve_schedule
import json
import datetime
import os
import sys

cwd = os.getcwd()

data_file = os.path.join(cwd, 'data\\schedules.json')

def get_regular():
    return sys.argv[1]

def get_exams(): 
    return sys.argv[2]

def get_year():
    return sys.argv[3]

def get_worker():
    return sys.argv[4]

# Gets the schedules of the 'worker'
# regular and exams will be either true or false and will determine which schedules to get
def get_schedules(regular, exams, year, worker):
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
         
def main():
    try:
        get_schedules(get_regular(), get_exams(), get_year(), get_worker())

        # Return json setting no error. 
        json = BuildJson({})
        print(json.getJson())
        sys.stdout.flush()
    except: 
        json_obj = BuildJson({'worker': get_worker()})
        json_obj.setError()
        print(json_obj.getJson())
        sys.stdout.flush()
    
main()