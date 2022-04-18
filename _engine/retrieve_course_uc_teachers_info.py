import Core
import sys
import multiprocessing as mp
import json

tables_file_path = './data/uc_teachers_table.json'

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

    # TODO testar mp, da um erro no meu pc mas pode ser por ser velho e isto ter mts processos
    '''
    with mp.Pool(processes=len(UCs)) as pool:
        CourseUCsTableInfo = pool.map(Core.get_UC_teacher_info, UCs)
    '''
    CourseUCsTableInfo = []

    for UC in UCs:
        CourseUCsTableInfo.append(Core.get_UC_teacher_info(UC))

    data.append({"name" : get_table_name(), "table" : CourseUCsTableInfo})

    json_object = json.dumps(data, indent=4)

    with open(tables_file_path, 'w', encoding='utf-8') as file:
        file.write(json_object)

    print(json_object)

    sys.stdout.flush()

if __name__ == '__main__':
    main()
