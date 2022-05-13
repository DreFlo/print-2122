import Core
from handle_json import BuildJson

courses_filePath = './data/courses.json'

def main():
    courses = Core.get_courses()

    coursesJson = BuildJson(courses)
    with open(courses_filePath, 'w', encoding='utf-8') as file:
        file.write(coursesJson.getJson())

    print(coursesJson.getJson())

    return

if __name__ == "__main__":
    main()