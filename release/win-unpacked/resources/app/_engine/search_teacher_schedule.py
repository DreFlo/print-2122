import Core
from handle_json import BuildJson
import sys
import Schedule


def get_year():
    return "2020"


def get_teacher_id():
    return sys.argv[1]


try:
    links_schedules, soup = Core.get_links_schedules(get_teacher_id(), get_year())
    name = Core.get_teacher_name_schedule(soup)
    weeks_schedule = {'name': name}

    for i, link in enumerate(links_schedules):
        htmlTable, week_range = Core.get_teacher_schedule_html(get_teacher_id(), get_year(), link)
        weeks_schedule[week_range] = str(htmlTable)

    jsonObject = BuildJson(weeks_schedule)
    json = jsonObject.getJson()
except:
    jsonObject = BuildJson({})
    jsonObject.setError()
    json = jsonObject.getJson()
finally:
    print(json)
    sys.stdout.flush()
