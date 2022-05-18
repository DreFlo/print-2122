import sys
from handle_json import BuildJson
import Login


def main():
    """
    Checks if the user is logged in sigarra

    :type jsonFile: Login
    :param jsonFile: an instance of Login

    :return: jsonFile
    """

    login = Login.Login()
    if login.htmlPage is None:
        jsonFile = BuildJson({'Name': 'NONE'})
    else:
        jsonFile = BuildJson({'Name': login.getNameLogin()})

    print(jsonFile.getJson())
    sys.stdout.flush()


main()
