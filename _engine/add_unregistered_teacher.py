import sys
import json
from handle_json import BuildJson
from tkinter import filedialog
from icalendar import Calendar, Event
from dateutil import parser

def get_name():
    return sys.argv[1]

def get_contract_start():
    return sys.argv[3]

def get_available_hours():
    return sys.argv[2]

def get_reminder():
    return sys.argv[4]

# Create .ics file where user chooses with reminder to add teacher to sigarra
def create_reminder():
    contractStart = parser.parse(get_contract_start())

    filepath = filedialog.asksaveasfilename(defaultextension='.ics', title='Choose filename', initialfile=get_name() + ".ics")

    if (filepath == ""): return

    cal = Calendar()
    event = Event()
    event.add('summary', 'Registar ' + get_name() + ' no sigarra')
    event.add('dtstart', contractStart)

    cal.add_component(event)

    with open(filepath, 'wb') as file:
        file.write(cal.to_ical())

    return

def main():
    with open('./data/unregistered_teachers.json', 'r', encoding='utf-8') as file:
        data = json.load(file)

    newTeacher = {"name" : get_name(), "code" : len(data['unregisteredTeachers']), "contractStart" : get_contract_start(), "availableHours" : get_available_hours(), "assignedHours" : 0}

    data['unregisteredTeachers'].append(newTeacher)

    json_object = BuildJson(data)

    if get_reminder():
        create_reminder()

    with open('./data/unregistered_teachers.json', 'w', encoding='utf-8') as file:
        file.write(json_object.getJson())

    print(json_object.getJson())

    sys.stdout.flush()

if __name__ == '__main__':
    main()