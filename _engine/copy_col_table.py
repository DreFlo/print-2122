import sys
from handle_json import BuildJson
import pandas as pd
import os

"""
Script responsible for copying a column in the table
"""


def get_table_html():
    with open(sys.argv[1], "r", encoding="utf-8") as file:
        html = file.read()
    os.remove(sys.argv[1])
    return html


def get_column_name():
    return sys.argv[2]


def main():
    table_html = get_table_html()
    df = pd.read_html(table_html)[0]
    df = df[get_column_name()]
    df = df.iloc[1:]
    df.to_clipboard(excel=True, index=False)

    jsonObject = BuildJson({})
    print(jsonObject.getJson())
    sys.stdout.flush()


main()
