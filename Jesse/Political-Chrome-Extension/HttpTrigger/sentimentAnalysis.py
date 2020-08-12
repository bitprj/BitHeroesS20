from . import Analysis

class Sentiment(Analysis.Analyze):
    pos = 0
    neu = 0
    neg = 0
    num = 0

    @classmethod
    def analyze(cls, client, document, i):
        cls.num += 1

        response = client.analyze_sentiment(documents = document)[i]

        cls.pos += response.confidence_scores.positive
        cls.neu += response.confidence_scores.neutral
        cls.neg += response.confidence_scores.negative

    def get_result(self):
        if self.check_for_mixed():
            return "Mixed"
        elif (self.pos > self.neg) and (self.pos > self.neu):
            return "Positive"
        elif ((self.neg > self.pos) and (self.neg > self.neu)):
            return "Negative"
        else:
            return "Neutral"

    def check_for_mixed(self):
        return (self.pos/self.num < 0.45) and (self.neu/self.num < 0.45) and (self.neg/self.num < 0.45)

    @classmethod
    def final_cycle_config(cls):
        cls.num = 1
    
    @classmethod
    def reset_variables(cls):
        cls.pos = 0
        cls.neu = 0
        cls.neg = 0
        cls.num = 0

    def get_value_dict(self):
        return {"sentiment": self.get_result(), 
        "positive": self.pos/self.num, 
        "neutral": self.neu/self.num, 
        "negative": self.neg/self.num}