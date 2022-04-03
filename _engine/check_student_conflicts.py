import Core
from handle_json import BuildJson
import sys

def get_UC_codes():
    codes_string =  sys.argv[1]
    return codes_string.split(sep=";")

codes = get_UC_codes()

tables =  {'name':'smth'}

tables['tables'] = Core.get_curricular_unit_students(codes[0])

jsonObject = BuildJson(tables)

json = jsonObject.getJson()

print(json)

sys.stdout.flush()