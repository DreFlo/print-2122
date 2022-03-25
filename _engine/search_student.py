import sys
import Core
from handle_json import BuildJson
import re
import pandas as pd
from bs4 import BeautifulSoup


def get_id_list():
    numbers = sys.argv[1]
    return re.findall(r'\d{9}', numbers)


def get_courses_list():
    courses = sys.argv[2]
    return re.findall(r'EIC\d*', courses)


def get_semester_year_list():
    semester_year = sys.argv[3]
    return re.findall(r'\w{1,2}-\d*', semester_year)


def get_with_media():
    return sys.argv[4] == "true"


def get_only_atrasadas():
    return sys.argv[5] == "true"


def get_students():
    numbers = get_id_list()
    df = pd.DataFrame()
    for number in numbers:
        df = get_student(number, get_with_media())

    return {'table': df.to_html(index=False)}


def get_student(student_id, with_media=False):
    """This function is responsible for getting the table for a student

    Args:
        student_id (string): Identification of a student
        with_media (boolean): Show the table with a media

    Returns:
        DateFrame: Table with students information
    """

    soup = Core.get_acadm_course(student_id)
    tables = soup.find_all("table", {"class": "dadossz"})
    df_ucs = Core.extract_simple_table(tables[0])

    # Get student general info
    media = Core.get_media(soup)
    curricular_year = get_curricular_year(soup)
    subscription_year = get_year_subscription(soup)
    current_year = get_years(df_ucs)[-1]

    # Treat data
    courses = get_courses_list()
    semester_year = get_semester_year_list()
    df_ucs = ucs_remove_nan(df_ucs)
    df_ucs = ucs_prepare(df_ucs)

    if get_only_atrasadas():
        df_ucs = ucs_atrasadas(df_ucs, curricular_year, subscription_year, current_year)
    else:
        df_ucs = ucs_filter(courses, semester_year, df_ucs)

    df_info = get_student_info(student_id, media, with_media)
    df = join_uc_student(df_ucs, df_info, student_id, media, with_media)
    df = df.fillna("")

    # Fix column order
    cols = ['Codigo', 'Nome', 'Curso', 'Cód.UC', 'UC', 'Nota', 'Ano(curr.)', 'Ano Let.', 'Per.', 'Cond.']
    df = df[cols]
    return df


def get_curricular_year(soup):
    info_table = soup.find('table', attrs={'class': 'formulario'})
    curricular_year_row = info_table.find_all("tr")[0]
    curricular_year = curricular_year_row.find_all('td')[1].text
    return curricular_year


def get_year_subscription(soup):
    info_table = soup.find('table', attrs={'class': 'formulario'})
    year_subscription_row = info_table.find_all("tr")[2]
    year_subscription = year_subscription_row.find_all('td')[1].text
    return year_subscription


def ucs_prepare(df):
    """
    Clean and treat the DataFrame for a student
    :param df: DataFrame
    :param student_id: Up Number
    :return:
    """
    years = get_years(df)
    df_year_status = generate_year_col(df, years)
    df = pd.concat([df['Unidades Curriculares'], df_year_status], axis=1)

    # Change columns name and drop columns.
    df = df.drop(columns=['Opção/Minor', 'Créd.'])
    df = df.rename(columns={'Nome': 'UC', 'Código': 'Cód.UC', 'Ano': 'Ano(curr.)'})

    return df


def ucs_remove_nan(df):
    """
    This function drops unuseful rows.
    """
    per_col = df['Unidades Curriculares']['Per.']
    indexes = per_col.index.values.tolist()
    for i in indexes:
        if str(per_col[i]) == "nan":
            df = df.drop([i])

    return df


def get_years(df):
    """
    Get's the years that a person have in the table
    :param df: DataFrame
    :return: An array with the years
    """
    years = []
    columns = df.columns
    for i in range(6, len(columns), 2):
        years.append(columns[i][0])
    return years


def generate_year_col(df, years):
    """
    This functions discards the years encapsulate the years rows to a new one.
    :param df: DataFrame
    :param years: Array with the years
    :return: DataFrame with the the year of the subjects taken
    """
    ucs_year = {'Ano Let.': [], 'Cond.': [], 'Nota': [], 'index': []}
    years = years[::-1]
    for year in years:
        ids = df.index.values.tolist()
        for i in ids:
            value = df.loc[i, (year, 'E')]
            value_r = df.loc[i, (year, 'R')]
            if str(value) != "nan" and i not in ucs_year['index']:
                ucs_year['index'].append(i)
                ucs_year['Ano Let.'].append(year)
                ucs_year['Cond.'].append(value)
                ucs_year['Nota'].append(value_r)

    df = pd.DataFrame(ucs_year, index=ucs_year['index'])
    df = df.drop(columns=['index'])

    return df


def ucs_filter(courses, semester_year, df):
    if len(courses) == 0 and len(semester_year) == 0:
        return df

    dfs_with_mask = []

    # Build semester_year mask.
    semester = [i.split("-")[0] for i in semester_year]
    year = [i.split("-")[1] for i in semester_year]

    for i in range(0, len(semester_year)):
        semester_year_mask = (df['Per.'] == semester[i]) & (df['Ano(curr.)'] == float(year[i]))
        dfs_with_mask.append(df.loc[semester_year_mask])

        # Build courses mask.
    if len(courses) != 0:
        course_mask = df['Cód.UC'].isin(courses)
        dfs_with_mask.append(df.loc[course_mask])

    return pd.concat(dfs_with_mask)


def ucs_atrasadas(df, curricular_year, subscription_year, current_year):
    mask_RFC = (df['Nota'] == 'RFC')
    mask_atrasada_doing = (
                (df['Nota'].isnull()) & (df['Ano Let.'] == current_year) & (df['Ano(curr.)'] != float(curricular_year)))
    doing_ucs = df.loc[mask_atrasada_doing]
    atrasadas = df.loc[mask_RFC]
    df = pd.concat([doing_ucs, atrasadas])
    return df


def get_student_info(student_id, media, with_media):
    soup = Core.get_bs_student(student_id)
    name = Core.get_name_student(soup)
    course = "".join([letter for letter in Core.get_course_student(soup) if letter.isupper()])
    indexes = [student_id]

    if with_media:
        df = pd.DataFrame({'Nome': pd.Series([name], index=indexes),
                           'Curso': pd.Series([course], index=indexes),
                           'Media': pd.Series([media], index=indexes)})
    else:
        df = pd.DataFrame({'Nome': pd.Series([name], index=indexes),
                           'Curso': pd.Series([course], index=indexes)})

    return df


def join_uc_student(df_ucs, df_info, student_id, media, with_media):
    nome = df_info.loc[:, 'Nome'].tolist()[0]
    curso = df_info.loc[:, 'Curso'].tolist()[0]

    if with_media:
        student_data = {"Codigo": student_id, "Nome": nome, "Curso": curso, "Nota": media, "UC": "[Media]"}
        df_ucs = pd.concat([pd.DataFrame(student_data, index=[1000]), df_ucs])

    # join df_info to df_ucs
    df_ucs['Codigo'] = student_id
    df_ucs['Nome'] = nome
    df_ucs['Curso'] = curso

    cols = df_ucs.columns.tolist()
    cols = cols[7:] + [cols[0]] + [cols[6]] + cols[1:6]
    df_ucs = df_ucs[cols]
    return df_ucs


def main():
    json = BuildJson(get_students())
    print(json.getJson())
    sys.stdout.flush()


main()
