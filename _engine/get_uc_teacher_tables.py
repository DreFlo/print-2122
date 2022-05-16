import json
import sys
from handle_json import BuildJson

tables_file_path = './data/uc_teachers_table.json'

def main():
    with open(tables_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    print(BuildJson(data).getJson())

    sys.stdout.flush()

if __name__ == '__main__':
    main()