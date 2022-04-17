import Core
import sys
from functools import reduce
import multiprocessing as mp
import json

def main():
    UCs = Core.get_course_UCs(22841, 2021)

    # TODO testar mp, da um erro no meu pc mas pode ser por ser velho e isto ter mts processos
    '''
    with mp.Pool(processes=len(UCs)) as pool:
        CourseUCsTableInfo = pool.map(Core.get_UC_teacher_info, UCs)
    '''
    CourseUCsTableInfo = []

    for UC in UCs:
        CourseUCsTableInfo.append(Core.get_UC_teacher_info(UC))

    json_object = json.dumps({'course' : CourseUCsTableInfo}, indent=4)
    
    print(json_object)

    with open('uc_teachers_table.json', 'w') as file:
        file.write(json_object)

    #sys.stdout.flush()

if __name__ == '__main__':
    main()
