import re
import requests
from handle_json import BuildJson
import sys

# Gets the a list with the codes of everyone in the DEI department
def get_dei_docents_list():
    response = requests.post('https://sigarra.up.pt/feup/pt/func_geral.QueryList', 
                    data={
                        'pv_unidade_nome' : 'Departamento de Engenharia InformÃ¡tica',
                        'p_n_registos' : '1000',
                        'p_unidade' : '151',
                        'P_NOME' : '',
                        'P_CODIGO' : '',
                        'P_SIGLA' : '',
                        'p_nivel' : '',
                        'pn_grupo' : '',
                        'pn_carreira' : '',
                        'pn_area' : '',
                        'pn_categoria': '',
                        'pv_categoria_nome' : '',
                        'pv_provimento' : '',
                        'pv_orgao' : '',
                        'pv_cargo' : '',
                        'P_ESTADO' : '',
                        'p_sala' : '',
                        'pv_sala_desc' : '',
                        'P_TELEFONE' : '',
                        'P_EMAIL' : '',
                        'p_area_id' : '',
                        'p_area' : ''
                    })

    content = str(response.content)
    pos = content.find("<h1>")
    new_content = content[pos:]
    list = new_content.split("<li>")
    docents_list = []

    for i in range(1, len(list)):
        m = re.search('(?<=CODIGO=)\d+', list[i])
        docents_list.append(m.group(0))
    return docents_list

def main():
    try:
        list = get_dei_docents_list()

        # Return json setting no error. 
        json = BuildJson({'list': list})
        print(json.getJson())
        sys.stdout.flush()
    except: 
        json_obj = BuildJson({})
        json_obj.setError()
        print(json_obj.getJson())
        sys.stdout.flush()
    
main()