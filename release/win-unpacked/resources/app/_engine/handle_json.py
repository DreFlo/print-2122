import json


class BuildJson:
    def __init__(self, dic=None):
        self.dictionary = dic
        self.dictionary['error'] = 'false'

    def setError(self):
        self.dictionary['error'] = 'true'

    def getJson(self):
        return json.dumps(self.dictionary)


