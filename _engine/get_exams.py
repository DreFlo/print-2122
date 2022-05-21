import Core
import sys
from handle_json import BuildJson


def main():
    exams_dict = {"error": False}
    exams_dict["exams"] = Core.get_exams(sys.argv[1])
    
    exams_json = BuildJson(exams_dict)

    print(exams_json.getJson())

    return

if __name__ == '__main__':
    main()