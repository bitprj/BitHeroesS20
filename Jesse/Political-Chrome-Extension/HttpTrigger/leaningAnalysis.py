import requests
from . import Analysis

class Leaning(Analysis.Analyze):
    url = "https://api.thebipartisanpress.com/api/endpoints/beta/robert"
    api_key = "gAAAAABeVpQJKRM5BqPX91XW2AKfz8pJosk182maAweJcm5ORAkkBFj__d2feG4H5KIeOKFyhUVSY_uGImiaSBCwy2L6nWxx4g=="

    text = ""

    leaning = 0
    num = 0

    @classmethod
    def analyze(cls, client, document, i):
        cls.num += 1
        cls.text = document[i]

        body = {"API": cls.api_key, "Text": cls.text} # terrible practice, really just a bandaid solution
        response = requests.post(cls.url, data=body) # terrible practice, really just a bandaid solution
        
        cls.leaning += float(response.text)

    def get_result(self):
        result_string = ""
        average_leaning = self.leaning/self.num

        if 14 < average_leaning and average_leaning < 21:
            return "Conservative"
        elif -14 > average_leaning and average_leaning > -21:
            return "Liberal"
        elif -7 < average_leaning and average_leaning < 7:
            return "Moderate"
        
        if abs(average_leaning) > 35:
            result_string += "Extremely "
        elif abs(average_leaning) > 21:
            result_string += "Somewhat "

        if abs(average_leaning) > 28:
            result_string += "Radically "
        elif abs(average_leaning) > 7:
            result_string += "Moderately "

        if average_leaning > 0:
            result_string += "Right"
            return result_string
        else:
            result_string += "Left"
            return result_string

    @classmethod
    def final_cycle_config(cls):
        cls.num = 1

    @classmethod
    def reset_variables(cls):
        cls.num = 0
        cls.leaning = 0

    def get_value_dict(self):
        return {"name" : self.get_result(),
        "score" : self.leaning/self.num}