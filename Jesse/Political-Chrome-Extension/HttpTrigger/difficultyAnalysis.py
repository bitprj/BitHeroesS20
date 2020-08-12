import re
from . import Analysis

class Difficulty(Analysis.Analyze):

    alphabets= "([A-Za-z])"
    prefixes = "(Mr|St|Mrs|Ms|Dr)[.]"
    suffixes = "(Inc|Ltd|Jr|Sr|Co)"
    starters = "(Mr|Mrs|Ms|Dr|He\s|She\s|It\s|They\s|Their\s|Our\s|We\s|But\s|However\s|That\s|This\s|Wherever)"
    acronyms = "([A-Z][.][A-Z][.](?:[A-Z][.])?)"
    websites = "[.](com|net|org|io|gov)"

    syllables = 0
    sentences = 0
    words = 0

    @classmethod
    def analyze(cls, client, document, i):
        text = document[i]
        sentence_list = cls.split_into_sentences(cls, text) # terrible practice, really just a bandaid solution
        cls.sentences += len(sentence_list)
        for sentence in sentence_list:
            word_list = sentence.split()
            cls.words += len(word_list)
            for w in word_list:
                cls.syllables += cls.syllable_count(cls, w) # terrible practice, really just a bandaid solution

    def split_into_sentences(self, text):
        text = " " + text + "  "
        text = text.replace("\n"," ")
        text = re.sub(self.prefixes,"\\1<prd>",text)
        text = re.sub(self.websites,"<prd>\\1",text)
        if "Ph.D" in text: text = text.replace("Ph.D.","Ph<prd>D<prd>")
        text = re.sub("\s" + self.alphabets + "[.] "," \\1<prd> ",text)
        text = re.sub(self.acronyms+" "+self.starters,"\\1<stop> \\2",text)
        text = re.sub(self.alphabets + "[.]" + self.alphabets + "[.]" + self.alphabets + "[.]","\\1<prd>\\2<prd>\\3<prd>",text)
        text = re.sub(self.alphabets + "[.]" + self.alphabets + "[.]","\\1<prd>\\2<prd>",text)
        text = re.sub(" "+self.suffixes+"[.] "+self.starters," \\1<stop> \\2",text)
        text = re.sub(" "+self.suffixes+"[.]"," \\1<prd>",text)
        text = re.sub(" " + self.alphabets + "[.]"," \\1<prd>",text)
        if "”" in text: text = text.replace(".”","”.")
        if "\"" in text: text = text.replace(".\"","\".")
        if "!" in text: text = text.replace("!\"","\"!")
        if "?" in text: text = text.replace("?\"","\"?")
        text = text.replace(".",".<stop>")
        text = text.replace("?","?<stop>")
        text = text.replace("!","!<stop>")
        text = text.replace("<prd>",".")
        sentences = text.split("<stop>")
        sentences = sentences[:-1]
        sentences = [s.strip() for s in sentences]
        return sentences

    def syllable_count(self, word):
        word = word.lower()
        count = 0
        vowels = "aeiouy"
        if word[0] in vowels:
            count += 1
        for index in range(1, len(word)):
            if word[index] in vowels and word[index - 1] not in vowels:
                count += 1
        if word.endswith("e"):
            count -= 1
        if count == 0:
            count += 1
        return count

    def get_result(self):
        asl = self.words/self.sentences
        asw = self.syllables/self.words
        return 206.835 - (1.015 * asl) - (84.6 * asw)

    @classmethod
    def final_cycle_config(cls):
        cls.sentences = 1
        cls.words = 1

    @classmethod
    def reset_variables(cls):
        cls.syllables = 0
        cls.sentences = 0
        cls.words = 0

    def get_value_dict(self):
        return {"syllables": self.syllables, 
        "sentences": self.sentences, 
        "words": self.words, 
        "asl": self.words/self.sentences, 
        "asw": self.syllables/self.words, 
        "flesch_reading_score": self.get_result()}