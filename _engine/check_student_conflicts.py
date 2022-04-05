import Core
from handle_json import BuildJson
import sys
from functools import reduce

def get_UC_codes():
    codes_string =  sys.argv[1]
    return codes_string.split(sep=";")

codes = get_UC_codes()

response =  {'name':'UCConflict'}

studentSets = []

for code in codes:
    studentSets.append(set(Core.get_curricular_unit_students(code)))

commonStudent = reduce(lambda x,y : x & y, studentSets)

response['conflict'] = list(commonStudent)

jsonObject = BuildJson(response)

json = jsonObject.getJson()

print(json)

sys.stdout.flush()