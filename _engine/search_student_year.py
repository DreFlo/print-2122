import sys
import Core
from handle_json import BuildJson
import re
import pandas as pd
from bs4 import BeautifulSoup as bs


def get_course_id():
    return sys.argv[1]


def get_curricular_year():
    return sys.argv[2]


def get_url():
    curr_year = get_curricular_year()
    course_id = get_course_id()

    return "https://sigarra.up.pt/feup/pt/fest_geral.fest_list?pv_num_pag=1&pv_numero_de_estudante=&pv_nome=&pv_estado=1&pv_curso_id=" + course_id + "&pv_em=2020&pv_ate=&pv_1_inscricao_em=&pv_ate_2=&pv_tipo=&pv_tipo_de_curso=MI&pv_area_form_cont_id=&pv_observacoes=&pv_ramo_id=&pv_ano_curr_min=" + curr_year + "&pv_ano_curr_max=" + curr_year + "&pv_email=&pv_n_registos=1000&pv_estatuto_id="


def main():
    try:
        html = Core.get_html_logged(get_url())
        soup = bs(html)
        table = soup.find('table', attrs={'class': 'dados'})
        df = Core.extract_simple_table(table)
        final_dict = {'table': df.to_html(index=False, escape=False)}
        json = BuildJson(final_dict)
        print(json.getJson())
        sys.stdout.flush()
    except:
        json = BuildJson({})
        json.setError()
        sys.stdout.flush()


main()
