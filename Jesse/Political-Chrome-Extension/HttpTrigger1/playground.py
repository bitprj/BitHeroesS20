import requests
import json

subscription_key = "acaa102d183f4260965c782bc60e2199"
search_term = "Microsoft"
search_url = "https://api.cognitive.microsoft.com/bing/v7.0/news/search"

headers = {"Ocp-Apim-Subscription-Key" : subscription_key}
params  = {"q": search_term, "count": 1}

response = requests.get(search_url, headers=headers, params=params)
response.raise_for_status()
search_results = json.dumps(response.json())
data = json.loads(search_results)
print(data["value"][0]["name"])
print(data["value"][0]["url"])
print(data["value"][0]["description"])