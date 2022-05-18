import sys
from handle_json import BuildJson
import os


# simple function to logout the person
def main():
    if os.path.exists("cookies.txt"):
        os.remove("cookies.txt")

    jsonObject = BuildJson({})
    print(jsonObject.getJson())
    sys.stdout.flush()


main()
