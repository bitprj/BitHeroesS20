class Analyze():
    def analyze(self):
        pass

    def get_result(self):
        pass

    def final_cycle_config(self):
        pass

    def reset_variables(self):
        pass

    def get_value_dict(self):
        pass

    def extract_phrases(self, client, document, i):
        phrase_list = []

        try:
            response = client.extract_key_phrases(documents = document)[i]

            if not response.is_error:
                for phrase in response.key_phrases:
                    phrase_list.append(phrase)
            else:
                print(response.id, response.error)

        except Exception as err:
            print("Encountered exception. {}".format(err))

        return phrase_list

    def get_temp_document(self, key_phrase_list, seperator):
        temp_list = []
        for i in key_phrase_list: 
            if i not in temp_list: 
                temp_list.append(i) 
                
        temp_document = seperator.join(temp_list)
        return [temp_document]