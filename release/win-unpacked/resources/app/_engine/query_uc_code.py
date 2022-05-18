import Core
from handle_json import BuildJson
import sys

def main():
    ucs_codes = sys.argv[1].split(" ")

    ucs = []

    for uc_code in ucs_codes:
        ucs = ucs + Core.get_UC_from_query(uc_code, sys.argv[2])
        
    results = {'ucs' : ucs}

    jsonObject = BuildJson(results)

    print(jsonObject.getJson())

    sys.stdout.flush()

if __name__ == '__main__':
    main()