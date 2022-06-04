from fileinput import filename
import sys
from handle_json import BuildJson
from tkinter import filedialog
import tkinter
import json
import os

schedules_path = ".resoursces/app/data/schedules.json"

def get_arg():
    return sys.argv[1]

def open_file():
    tkinter.Tk().withdraw()
    filename = filedialog.askopenfilename(defaultextension='.json', title='Escolha ficherio de horário')
    if(filename):
        if(os.path.getsize(filename) == 0):
            return get_error_json("Ficheiro vazio")
        
        name, extension = os.path.splitext(filename)
        if(extension != ".json"):
            return get_error_json("Ficheiro de formato errado, deve ser .json")
        
        f = open(filename, "r", encoding="utf-8")
        json_object = json.loads(f.read())

        if('updates' not in json_object.keys()):
            return get_error_json("Ficheiro com dados mal formatados")

        updates_info = json_object['updates']
        class_update = updates_info['class_schedules']
        exams_update = updates_info['exam_schedules']
        
        return BuildJson({'message': "Válido", 'file_path': filename, 'class_update': class_update, 'exam_update': exams_update})
    else:
        return get_error_json("Ficheiro inválido")

def save_file():
    import_f = open(get_arg(), "r", encoding="utf-8")
    new_schedules = json.loads(import_f.read())
    json_object = json.dumps(new_schedules, indent=4, ensure_ascii=False)
    import_f.close()

    old_f = open(schedules_path, "w", encoding="utf-8")
    old_f.seek(0)
    old_f.write(json_object)
    old_f.truncate()
    old_f.close()


def get_error_json(message):
    json = BuildJson({'message': message})
    json.setError()
    return json

if __name__ == '__main__':
    if(get_arg() == "open_file"):
        json_object = open_file()
    else:
        save_file()
        json_object = BuildJson({})
        
    print(json_object.getJson())
    sys.stdout.flush()