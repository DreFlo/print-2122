from tkinter import filedialog
import tkinter
import sys
import json
from handle_json import BuildJson
import datetime

schedules_path = "./resources/app/data/schedules.json"

def main():
    tkinter.Tk().withdraw()
    filepath = filedialog.askdirectory(title="Escolha localização para guardar ficheiro de horários")
    f = open(schedules_path, "r", encoding="utf-8")
    json_object = json.loads(f.read())
    updates_info = json_object['updates']
    class_update = datetime.datetime.strptime(updates_info['class_schedules'], "%d-%m-%Y")
    exams_update = datetime.datetime.strptime(updates_info['exam_schedules'], "%d-%m-%Y")
    max_date = max(class_update, exams_update)
    filename = "Horários_" + max_date.strftime("%d-%m-%Y") + ".json"
    file = open(filepath + "/" + filename, "w", encoding="utf-8")
    file.write(json.dumps(json_object, indent=4, ensure_ascii=False))
    file.close()
    

if __name__ == '__main__':
    main()
    json = BuildJson({})
    print(json.getJson())
    sys.stdout.flush()