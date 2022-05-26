import json
import Core
import sys
from handle_json import BuildJson

exams_filepath = './data/exams.json'
courses_filepath = './data/courses.json'

def get_courses():
    f = open(courses_filepath)
    json_object = json.load(f)
    f.close()
    return json_object

def main():

    exams = Core.get_exams(get_courses()["courses"])
    exams_json = BuildJson(exams)

    with open(exams_filepath, 'w', encoding='utf-8') as file:
        file.write(exams_json.getJson())

    print(exams_json.getJson())
    sys.stdout.flush()

if __name__ == "__main__":
    main()