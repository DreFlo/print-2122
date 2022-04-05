import Core
from handle_json import BuildJson
import sys
from functools import reduce
import multiprocessing as mp

def get_UC_codes():
    codes_string =  sys.argv[1]
    return codes_string.split(sep=";")

def get_UC_students_set(code):
    return set(Core.get_curricular_unit_students(code))

codes = get_UC_codes()

response =  {'name':'UCConflict'}

studentSets = []

with mp.Pool(processes=len(codes)) as pool:
    studentSets = pool.map(get_UC_students_set, codes)

commonStudent = reduce(lambda x,y : x & y, studentSets)

response['conflict'] = list(commonStudent)

jsonObject = BuildJson(response)

json = jsonObject.getJson()

print(json)

sys.stdout.flush()