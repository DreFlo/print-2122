import sys
from tkinter import filedialog
from handle_json import BuildJson
import pandas as pd
import datetime

"""
Script responsible for copying the table to the clipboard as csv. 
"""


def get_table_html():
    return sys.argv[1]


def main():
    table_html = get_table_html()
    df = pd.read_html(table_html)[0]
    filepath = filedialog.asksaveasfilename(defaultextension='.csv', filetypes=[('CSV', '*.csv')], title='Choose filename')
    df.to_csv(filepath, index=False)

    jsonObject = BuildJson({})
    print(jsonObject.getJson())
    sys.stdout.flush()

main()

