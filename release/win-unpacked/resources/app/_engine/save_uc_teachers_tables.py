import sys
import json
from handle_json import BuildJson
import os

cwd = os.getcwd()

tables_file_path = os.path.join(cwd, 'resources\\app\\data\\uc_teachers_table.json')

def main():
    tables = json.loads(sys.argv[1])

    json_object = BuildJson(tables)

    with open(tables_file_path, 'w', encoding='utf-8') as file:
        file.write(json_object.getJson())

    print(BuildJson({"done" : True}).getJson())

    sys.stdout.flush()

if __name__ == '__main__':
    main()