import sys
import json
from handle_json import BuildJson


def main():
    with open('./data/unregistered_teachers.json', 'r', encoding='utf-8') as file:
        data = json.load(file)

    newTeacher = {"name" : sys.argv[1], "code" : len(data['unregisteredTeachers']), "contractStart" : sys.argv[3], "availableHours" : sys.argv[2], "assignedHours" : 0}

    data['unregisteredTeachers'].append(newTeacher)

    json_object = BuildJson(data)

    with open('./data/unregistered_teachers.json', 'w', encoding='utf-8') as file:
        file.write(json_object.getJson())

    print(json_object.getJson())

    sys.stdout.flush()

if __name__ == '__main__':
    main()