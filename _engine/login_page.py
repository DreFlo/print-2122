import sys
from handle_json import BuildJson
import Login

def getUsername():
    return sys.argv[1]


def getPassword():
    return sys.argv[2]


def main():
    try: 
        login = Login.Login()
        login.authenticate(getUsername(), getPassword())
        name = login.getNameLogin()
    except: 
        jsonObject = BuildJson({'Name': 'NONE'})
        jsonObject.setError() 
    else:
        jsonObject = BuildJson({'Name': name})
    finally: 
        print(jsonObject.getJson())
        sys.stdout.flush()


main()
