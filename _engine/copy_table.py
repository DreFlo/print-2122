import sys
from handle_json import BuildJson
import pandas as pd

"""
Script responsible for copying the table 
"""


def get_table_html():
    return sys.argv[1]


def main():
    table_html = get_table_html()
    df = pd.read_html(table_html)[0]
    df.to_clipboard(excel=True, index=False)

    jsonObject = BuildJson({})
    print(jsonObject.getJson())
    sys.stdout.flush()

main()

