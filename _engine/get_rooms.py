import Core
import sys
from handle_json import BuildJson

rooms_file_path = './data/rooms.json'

def main():
    rooms = Core.get_rooms(1403)

    data = {'rooms' : []}

    for room in rooms:
        data['rooms'].append(Core.get_room_info(room))

    data['rooms'] = [room for room in data['rooms'] if room != None]

    print(data)

    json_object = BuildJson(data)

    with open(rooms_file_path, 'w', encoding='utf-8') as file:
        file.write(json_object.getJson())

    sys.stdout.flush()

if __name__ == '__main__':
    main()