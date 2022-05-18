import sys
from bs4 import BeautifulSoup as bs
from handle_json import BuildJson
import mechanize as mc
import Core
import pandas as pd

import re


def getCode():
    return sys.argv[1]


def getSite():
    return "https://sigarra.up.pt/feup/en/teses.teses_orientador?p_record_set_size=1000" + "&p_sigla=&p_ord_campo=DATA_INICIO&p_docente=" + getCode() + "&p_tipo_lista=C"


def get_info(lista):
    final_dict = {}
    for i, item in enumerate(lista):
        # find all links
        spans = item.findAll("br")

        temp_dict = {}
        temp_dict['Course'] = spans[1].findNext("a").text
        temp_dict['Degree'] = spans[2].findNext("span").text.replace("Grau:", "").split(":")[1]
        temp_dict['Title'] = item.findNext("a").text
        temp_dict['Student'] = spans[0].findNext("a").text
        try:  # date
            temp_dict['Date'] = re.findall(r"\d\d-\w\w\w-\d\d\d\d", item.text)[0]
        except:
            temp_dict['Date'] = ""

        temp_dict['Role'] = spans[3].findNext("span").text.replace("Papel:", "").split(":")[1]
        temp_dict['Link'] = 'https://sigarra.up.pt/feup/pt/' + item.findNext('a', href=True)['href']

        final_dict[i] = temp_dict

    return final_dict


def main():
    try:
        br = mc.Browser()
        html = Core.get_html(br, getSite())
        thesis_list = bs(html).find("h2").findNext("ul").findAll("li")
        name = bs(html).findAll('div', attrs={'id': 'conteudoinner'})[0].findAll('h2')[0].text
    except:
        json = BuildJson({})
        json.setError()
    else:
        thesis_dict = get_info(thesis_list)
        df = pd.DataFrame(thesis_dict)
        df = df.transpose()
        df['Link'] = "<a href='" + df['Link'] + "'>Link</a>"
        final_dict = {'Name': name, 'html': df.to_html(index=False, escape=False)}
        json = BuildJson(final_dict)
    finally:
        print(json.getJson())
        sys.stdout.flush()


main()
