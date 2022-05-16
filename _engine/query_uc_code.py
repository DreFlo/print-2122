import Core
from handle_json import BuildJson
import sys

def main():
    ucs_codes = sys.argv[1].split(" ")

    ucs = []

    for uc_code in ucs_codes:
        ucs += Core.get_UC_from_query(uc_code, sys.argv[2])
        
    results = {'ucs' : list(set(ucs))}

    jsonObject = BuildJson(results)

    print(jsonObject.getJson())

    sys.stdout.flush()