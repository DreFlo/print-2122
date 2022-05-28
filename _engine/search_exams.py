import Core
import sys
from handle_json import BuildJson

exams_filepath = './data/exams.json'
courses_filepath = './data/courses.json'

def get_course():
    return sys.argv[1]

def get_uc():
    return sys.argv[2]

def add_teachers_and_time_to_exam(exam):
    return Core.get_with_exam_teachers_and_time(exam)

def main():
    tempExams = [exam for exam in Core.get_exams(get_course()) if exam['uc'].lower() == get_uc().lower()]

    exams = [add_teachers_and_time_to_exam(exam) for exam in tempExams]

    exams_json = BuildJson({"exams" : exams})

    print(exams_json.getJson())
    sys.stdout.flush()

if __name__ == "__main__":
    main()