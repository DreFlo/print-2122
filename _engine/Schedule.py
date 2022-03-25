from enum import Enum
import handle_json

week = ["Segunda", "Terca", "Quarta", "Quinta", "Quinta", "Sexta", "Sabado"]


class Week(Enum):
    SEG = 0
    TER = 1
    QUA = 2
    QUI = 3
    SEX = 4
    SAB = 5


class Schedule:
    """
    Class that contains the schedule information for one professor. The schedule is the same for a period of time
    """

    def __init__(self):
        """
        :type scheduleDic: dict
        :param scheduleDic: Final dictionary with all information: scheduleDic = {"Segunda": [hour1, hour2] , "Terça": [hour3, hour4], ...}

        :type schedule: dict
        :param schedule: Dictionary of the hours
        """

        self.scheduleDic = {}

        # set each day with an empty list of hours
        for i in range(7):
            self.scheduleDic[week[i]] = []

    def add_time(self, hour):
        self.scheduleDic[hour.getDay()].append(hour.getDic())

    def add_week_range(self, week_range):
        self.scheduleDic['week_range'] = week_range

    def get_dic(self):
        return self.scheduleDic


class Hour:
    # day:  Week enumerator
    # hour: float
    # duration:  integer
    def __init__(self, day, hour, duration, spec):
        self.day = day
        self.hour = hour
        self.duration = duration
        self.spec = spec

    def getDay(self): return week[self.day]

    def getDayEnum(self): return self.day

    def getHour(self): return self.hour

    def getDuration(self): return self.duration

    def getSpecification(self): return self.spec

    def getString(self):
        return self.getDay() + "\nStart: " + str(self.hour) + "\nDuration: " + str(
            self.duration) + "\n Specification: " + str(self.spec)

    def getDic(self):
        return {'Hora': self.hour, 'Duracao': self.duration, 'spec': self.spec}
