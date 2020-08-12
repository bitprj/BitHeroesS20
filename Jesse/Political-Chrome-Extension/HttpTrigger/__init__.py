import logging
import azure.functions as func
import random

from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential

import json

from . import webScrape
from . import difficultyAnalysis
from . import sentimentAnalysis
from . import leaningAnalysis

key = "3836568134ba4356a6242077bd107cad"
endpoint = "https://article-analysis.cognitiveservices.azure.com/"

cycle = 0
article_content_list = []
analysis_type = ""
key_phrase_string = ""
get_phrases = 1
continue_running = True

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    
    name = req.params.get('name')
    cycle = req.params.get('cycle')
    analysis = req.params.get("analysis")
    phrases = req.params.get("phrases")

    if not name:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            name = req_body.get(f'name')

    if name and cycle and analysis and phrases:
        update_variables(name, cycle, analysis, phrases)

        analysis_obj = create_analysis_obj()
        document = webScrape.create_new_list(article_content_list, cycle)

        return func.HttpResponse(get_analytics(analysis_obj, document)) 

    else:
        return func.HttpResponse(status_code = 400)

def update_variables(url_name, current_cycle, analysis, phrases):
    global article_content_list 
    global cycle
    global analysis_type
    global get_phrases

    analysis_type = analysis
    cycle = current_cycle
    article_content_list = webScrape.get_article_content_list(url_name)
    get_phrases = int(phrases)

def create_analysis_obj():
    if analysis_type == "sentiment":
        return sentimentAnalysis.Sentiment()
    elif analysis_type == "difficulty":
        return difficultyAnalysis.Difficulty()
    else:
        return leaningAnalysis.Leaning()

def get_analytics(a, document):
    global continue_running
    global key_phrase_string

    random_num_list = []

    temp_key_phrase_list = []

    seperator = " "

    if len(document):
        client = authenticate_client() 

        for i in range (0, len(document)):
            a.analyze(client, document, i)

            if get_phrases:
                temp_list = a.extract_phrases(client, document, i)
                random_num = random.randint(0,len(temp_list) - 1)
                if random_num not in random_num_list:
                    temp_key_phrase_list.append(temp_list[random_num])
                    random_num_list.append(random_num)

        if get_phrases:
            temp_document = a.get_temp_document(temp_key_phrase_list, seperator)
            final_phrases_list = a.extract_phrases(client, temp_document, 0)

            key_phrase_string = seperator.join(final_phrases_list)

    else:
        continue_running = False
        a.final_cycle_config()

    return get_json_results(a)

def authenticate_client():
    ta_credential = AzureKeyCredential(key)
    text_analytics_client = TextAnalyticsClient(
            endpoint=endpoint, credential=ta_credential)
    return text_analytics_client

def get_json_results(a):
    value_dict = a.get_value_dict()
    python_results = {"value": value_dict, "continue": continue_running}
    if get_phrases:
        python_results.__setitem__('phrases', key_phrase_string)
    reset_values(a)
    return json.dumps(python_results)

def reset_values(a):
    global cycle
    global continue_running
    global article_content_list
    global analysis_type
    global key_phrase_string
    global get_phrases

    cycle = 0
    article_content_list = []
    analysis_type = ""
    key_phrase_string = ""
    get_phrases = 1
    continue_running = True

    a.reset_variables()