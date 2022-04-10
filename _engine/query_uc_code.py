import Core
from handle_json import BuildJson
import sys

def main():
    results = {'ucs' : Core.get_UC_from_query(sys.argv[1], sys.argv[2])}

    jsonObject = BuildJson(results)

    print(jsonObject.getJson())

    sys.stdout.flush()

if __name__ == "__main__":
    main()