import Core
import sys 
from bs4 import BeautifulSoup as bs
import json 
import re
from datetime import date
from handle_json import BuildJson

# docents_schedule_path = "./data/schedules.json"
docents_schedule_path = "./data/temp_workers.json"

def get_teachers_id():
    return sys.argv[1]

def get_academic_year(): 
    return sys.argv[2]


def update_schedule(docent_id):  
    """Updates the schedule of a docent if necessary. 

    Args:
        docent_id (string): Docent identification. 
    """
    if must_scrape_sched(docent_id): 
        schedule, due_to = get_complete_schedule(docent_id)  
        save_sched(schedule, due_to, docent_id) 

def must_scrape_sched(docent_id):   
    """Checks if it's necessary to update a docent schedule.

    Args:
        docent_id (string): Docent identification. 

    Returns:
        Boolean: True if schedule needs to be updated. False otherwise. 
    """
    now = date.today() 
    f = open(docents_schedule_path, "r", encoding="utf-8") 
    json_object = json.load(f)  
    f.close()
    if json_object.get(docent_id) == None: 
        return True 
    else:
        if(docents_schedule_path == "./data/schedules.json"):
            due_to = string_to_date(json_object.get(docent_id).get("due_to"))
        else:
            due_to = string_to_date(json_object.get(docent_id).get("class_schedule").get("due_to"))
        return now >= due_to  

def save_sched(schedule, due_to, docent_id):   
    """Saves the schedule in file. 

    Args:
        schedule (dict): Complete dictionary of schedules. 
        due_to (datetime): The schedule is valid until this date. 
        docent_id ([type]): Docent identification.
    """
    due_to = due_to.strftime("%d-%m-%Y")
    docent_json = {'due_to': due_to, 'schedule': schedule} 
    f = open(docents_schedule_path, "r+", encoding="utf-8")
    all_schedules = json.loads(f.read())  
    if(docents_schedule_path == "./data/schedules.json"):
        all_schedules[docent_id] = docent_json
    else:
        all_schedules[docent_id]['class_schedule'] = docent_json
    json_object = json.dumps(all_schedules, indent=4, ensure_ascii=False)
    f.seek(0)
    f.write(json_object)
    f.truncate()
    f.close()

def get_complete_schedule(docent_id, academic_year = 0):  
    """Scrape all the docent schedules from sigarra in a year.

    Args:
        docent_id (string): Docent identification.  

    Returns:
        array : Array containing the schedules. 
    """
    schedules = [] 
    # When will this schedule not be valid anymore. 
    due_to = date.today()            
    # In a year a docent has many schedules. Now we are retrieving these links. 

    if(academic_year == 0):
        academic_year == get_academic_year()
    
    links_schedules, soup = Core.get_links_schedules(docent_id, academic_year)
    teacher_name = Core.get_teacher_name_schedule(soup)
    
    for link in links_schedules: 
        html = Core.get_html_logged(link) 
        soup = bs(html, "html.parser") 
        start_date, end_date = extract_period_from_soup(soup)
        sched = extract_table_schedule(soup, start_date, end_date, teacher_name)  
        schedules += sched 
        # Extracting the ending date
        end_date = string_to_date(end_date) 
        # Updating the due_to date. 
        due_to = max(end_date, due_to)   
        
    return schedules, due_to
  
def extract_period_from_soup(soup): 
    """Given a schedule page from sigarra, we are extrating the period that this schedule is valid. 

    Args:
        soup (BeautifulSoup): Beautifulsoup object referencing the html page. 

    Returns:
        array[string]: Array containing the start_date and end_date as [start_date, end_date]
    """
    subtitle = soup.find("h3").decode_contents()
    return re.findall("[0-9]{2}-[0-9]{2}-[0-9]{4}", subtitle) 

def string_to_date(date_string):   
    """Converts a string date to a datetime object. 

    Args:
        date_string (string): string to be converted. 

    Returns:
        datetime
    """
    date_arr = list(map(int, date_string.split("-"))) 
    return date(date_arr[2], date_arr[1], date_arr[0])
        
def extract_table_schedule(soup, start_date, end_date, teacher_name): 
    """Extract the schedule table from a specific sigarra page and converts it to a dicionary. 
    The dictionary matches the format described in https://github.com/Jumaruba/guiSigtools/wiki/Schedule-retrieve. 

    Args:
        soup (BeautifulSoup): The html page. 
        start_date (string): The valid start date of this schedule. 
        end_date (string): The valid end date of thsi schedule. 

    """
    schedules = []
    table_soup = soup.find("table", {"class": "horario"})
    trs = table_soup.find_all("tr", recursive=False)
    matrix_table = schedule_to_2d(trs) 
    for i, tr in enumerate(matrix_table):   
        for day, td in enumerate(tr):  
            td = bs(str(td), "html.parser")
            if td.acronym != None:  
                start_time = convert_time(i)
                schedules.append(get_class_in_td(td.td, start_date, end_date, start_time, day, teacher_name))

    return schedules 

def schedule_to_2d(trs):   
    """Transforms an html schedule in a 2d array. 
    This is an important function, since it handles with the fact that there're rowspans. 

    Args:
        trs (array): Array of the soup <tr> tags. 

    Returns:
        array[array]: Matrix containing the <tr> tags. 
    """
    timer = [0,0,0,0,0,0]   
    trs_size = len(trs)
    matrix = [[] for _ in range(trs_size)]

    for i in range(1, trs_size): 
        tds = trs[i].find_all("td", recursive=False) 
        day = 0
        tds_size = len(tds)
        for j in range(1, tds_size):    
            while day < 6 and timer[day] != 0: 
                timer[day] = max(timer[day]-1, 0)
                matrix[i-1].append("")
                day += 1
            if day >= 6: break 

            if tds[j].get('rowspan') != None:  
                timer[day] += int(tds[j]['rowspan']) - 1
            
            if tds[j].acronym != None:
                matrix[i-1].append(tds[j]) 
            else: 
                matrix[i-1].append("")
            day+= 1 

    return matrix

# This function get's the information of class in a <td> tag. 
# Notice that some fields such as start_time and start_time will be added later. 
def get_class_in_td(soup_td, start_date, end_date, start_time, day, teacher_name):    
    return {  
        "day": day, 
        "start_time": start_time,  
        "duration": int(soup_td['rowspan'])/2, 
        "name": soup_td.acronym['title'], 
        "class_name": soup_td.acronym.a.decode_contents(),  
        "lesson_type": soup_td['class'][0],   
        "link": soup_td.a['href'], 
        "location": soup_td.td.a.decode_contents(),  
        "start_date": start_date, 
        "end_date": end_date, 
        "teacher_name": teacher_name,
    } 


# Convert the index in time.
def convert_time(index):   
    return 8 + index * 0.5
    
def main():  
    try:
        docents = get_teachers_id().split(";")
        for docent_id in docents:
            update_schedule(docent_id)

        # Return json setting no error. 
        json = BuildJson({})
        print(json.getJson())
        sys.stdout.flush()
    except: 
        json_obj = BuildJson()
        json_obj.setError()
        sys.stdout.flush()

if __name__ == "__main__":
    main()
