import newspaper
from newspaper import Article

def get_article_content_list(article_url):
    article = Article(article_url)
    article.download()
    article.parse()
    article_content = list(article.text.split("\n"))

    for i in article_content:
        if not i:
            article_content.remove(i)

    return article_content

def create_new_list(article_content_list, cycle):
    new_list = []
    counter = 0
    items = 0

    if article_content_list:
        temp_list = list_after_cycle(article_content_list, cycle)
        print(len(temp_list))
        while (counter < 5120) and (items < 10) and (temp_list) and (items < len(temp_list)):
            if temp_list[items]:
                counter += len(temp_list[items])
                if (counter < 5120) and (items < 10):
                    new_list.append(article_content_list[items])
                    items += 1
                elif (counter > 5120) and (items == 0):
                    return new_list
                else:
                    break
    return new_list

def list_after_cycle(article_content_list, cycle):
    counter = 0
    items = 0

    temp_list = article_content_list

    cycle_num = int(cycle)

    if (cycle_num != 0):
        for _ in range(0, cycle_num):
            while (counter < 5120) and (items < 10) and (temp_list):
                if temp_list[0]:
                    counter += len(temp_list[0])
                    items += 1
                    if (counter < 5120) and (items < 10):
                        del temp_list[0]
                    else:
                        break
                else:
                    del temp_list[0]
            counter = 0
            items = 0
    return temp_list