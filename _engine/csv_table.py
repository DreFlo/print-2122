import sys
from tkinter import filedialog
from handle_json import BuildJson
import pandas as pd
import datetime
import os

"""
Script responsible for copying the table to the clipboard as csv. 
"""


def get_table_html():
    with open(sys.argv[1], "r", encoding="utf-8") as file:
        html = file.read()
    os.remove(sys.argv[1])
    return html



def main():
    table_html = get_table_html()
    df = pd.read_html(table_html)[0]
    filepath = filedialog.asksaveasfilename(defaultextension='.csv', filetypes=[('CSV', '*.csv')], title='Choose filename', initialfile=sys.argv[2] + ".csv")
    if (filepath != ""):
        df.to_csv(filepath, index=False)

    jsonObject = BuildJson({})
    print(jsonObject.getJson())
    sys.stdout.flush()

main()

