import Core
from handle_json import BuildJson
import sys

def get_UC_codes():
    codes_string =  sys.argv[1]
    return codes_string.split(sep=";")
