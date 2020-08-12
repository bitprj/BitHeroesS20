import logging
import azure.functions as func
import json
import requests

subscription_key = "acaa102d183f4260965c782bc60e2199"
search_url = "https://api.cognitive.microsoft.com/bing/v7.0/news/search"

counter = 1
search_term = ""

value_data_list = []


headers = {"Ocp-Apim-Subscription-Key" : subscription_key}
params  = {"q": search_term, "count": counter}
#
# Make sure to keep your keys private, you're gonna get scraped!
# Also, figure how tf your calls reached 56k
# Also, set up new Azure account for 30 more days of free trial
#
#

def main(req: func.HttpRequest) -> func.HttpResponse:
    global search_terms
    global counter
    global value_data_list

    logging.info('Python HTTP trigger function processed a request.')

    phrases = req.params.get('phrases')
    url = req.params.get('url')
    count = req.params.get('count')
    if not phrases:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            phrases = req_body.get('phrases')
    if count:
        counter = count
    if phrases and url:
        search_terms = phrases

        data_dict = create_data_dict()
        set_data_list(data_dict)
        check_for_initial(url)

        return func.HttpResponse(get_json_results())
    else:
        return func.HttpResponse(
             "Please pass a search query phrase on the query string or in the request body",
             status_code=400
        )

def create_data_dict():
    response = requests.get(search_url, headers=headers, params=params)
    response.raise_for_status()
    search_results = json.dumps(response.json())
    return json.loads(search_results)

def set_data_list(data_dict):
    global value_data_list
    for i in range(0, counter):
        temp_data_dict = {}
        temp_data_dict["name"] = data_dict["value"][i]["name"]
        temp_data_dict["url"] = data_dict["value"][i]["url"]
        temp_data_dict["description"] = data_dict["value"][i]["description"]
        value_data_list.append(temp_data_dict)

def check_for_initial(url):
    global value_data_list
    for data in value_data_list:
        if data["url"] == url:
            value_data_list.remove(data)

def get_json_results():
    python_results = { "site" : value_data_list }
    reset_values()
    return json.dumps(python_results)

def reset_values():
    global counter
    global search_term
    global value_data_list
    
    counter = 1
    search_term = ""

    value_data_list = []