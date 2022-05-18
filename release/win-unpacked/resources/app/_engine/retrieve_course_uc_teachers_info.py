import Core
import sys
import multiprocessing as mp
import json
from handle_json import BuildJson
import os

cwd = os.getcwd()

tables_file_path = os.path.join(cwd, 'resources\\app\\data\\uc_teachers_table.json')

def get_table_name():
    return sys.argv[1]

def get_course_id():
    return sys.argv[2]

def get_year():
    return sys.argv[3]

def main():
    UCs = Core.get_course_UCs(get_course_id(), get_year())

    with open(tables_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    '''
    with mp.Pool(processes=len(UCs)) as pool:
        CourseUCsTableInfo = pool.map(Core.get_UC_teacher_info, UCs)
    '''

    CourseUCsTableInfo = []

    for UC in UCs:
        CourseUCsTableInfo.append(Core.get_UC_teacher_info(UC))

    data["data"].append({"name" : get_table_name(), "id" : get_course_id(), "table" : CourseUCsTableInfo})

    json_object = BuildJson(data)

    with open(tables_file_path, 'w', encoding='utf-8') as file:
        file.write(json_object.getJson())

    # Kinda stupid but consistently has bugs otherwise
    with open(tables_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    print(BuildJson(data).getJson())

    sys.stdout.flush()

if __name__ == '__main__':
    main()
