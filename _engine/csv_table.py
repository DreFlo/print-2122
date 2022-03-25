import sys
from handle_json import BuildJson
import pandas as pd

"""
Script responsible for copying the table to the clipboard as csv. 
"""


def get_table_html():
    return sys.argv[1]


def main():
    table_html = get_table_html()
    df = pd.read_html(table_html)[0]
    df.to_csv('../table.csv', index=False)

    jsonObject = BuildJson({})
    print(jsonObject.getJson())
    sys.stdout.flush()

main()

