import json
import Core
import sys
from handle_json import BuildJson

exams_filepath = './data/exams.json'
courses_filepath = './data/courses.json'

def get_course():
    return sys.argv[1]

def get_uc():
    return sys.argv[2]

def main():
    exams = [exam for exam in Core.get_exams(get_course()) if exam['uc'].lower() == get_uc().lower()]

    exams_json = BuildJson({"exams" : exams})

    print(exams_json.getJson())
    sys.stdout.flush()

if __name__ == "__main__":
    main()