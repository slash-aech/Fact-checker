import groq
GROQ_API_KEY = "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"

# Initialize the Groq client
client = groq.Client(api_key=GROQ_API_KEY)
  # send_query_to_api(input_query, response_text)

def process_query(query, response_text):
    """
    Sends the query and response to Groq Chat API using the Groq SDK.
    It returns a cleaned version of the response along with a summary of the same length.
    """
    try:
        prompt = f"""
        You are an AI fact checker, you directly consult with the user that is asking you the query. You have to respond in minimum of 150 words and maximum of 500 words Your task is to:
        0. If some information regarding a certain query is to obvious you can add your own data and respond without relying much on the articles
        1. Correct the given text and respond as if you are texting the person in front who was asking you the query, don't explicitly mention that this is cleaned text or that this is the type of query, just put it out there without anything which may look like it's generated.. Never change the proper nouns that are mentioned in the message, never at all.
        2. Your main motive will be to always answer the query that was given by the user. Frame the entire message in format where it tries to solve the user's query.
        3. try to answer based on context window of present and not extreme future. try to answer how it affects now and only mention the future after a bit of time
        Always give a separate sentence stating yes, no or undeterministic when you compare the query, whether what the user has asked for is correct or false according to the news that you get; with response you get from fetched news right at the beginning of your response
        3. Don't add anything from your side. If any of the news seem to not be making sense with respect to the query asked by the user, reply with there is too little evidence to form something solid.
        Avoid repetition of responses and also don't prompt or add comments in your response, your response will be used directly as is and will be displayed so only have escape sequences and nothing else other than that.
        4. compare the user query along with the result and see how much of the data is answered by the result that is fetched and presented to you with respect to the query
        5. Use the result and make same size of content as summary to display on the webpage.
        6. Don't add anything on the start or end or anywhere which is not relevant to the result, including the system messages, even the cleaned text at the start
        7. Always add date wheneve possible. This is very important and if date is not found, mention it in the message that the date for this is not available
        8. Now the info should be completely related to news and not to anything else, if something is not related to actual news or anything which is similar to structure like news/trending/fact checking, make it look like fact checking rather than blandly giving result.
        9. You must at the start mention the type of query/response like news/fact-check/information-seeking or not related to the website/filler.
        10. keep it basic string friendly and don't add markup language 

        result:
        {response_text}

        Always make sure to use this {query} as question and {response_text} as answer
        User Query:
        {query}

        Provide the cleaned text followed by a summary of the same length.
        """
        
        # Call Groq Chat API
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.6,
            messages=[{"role": "user", "content": prompt}],
        )

        cleaned_summary = response.choices[0].message.content

        return cleaned_summary
    
    except Exception as e:
        return {"error": str(e)}
    

def make_query(query):
    """
    Firstly, to make the query 
    """
    try:
        prompt = f"""
        You are AI news search tool, you have make or mark the headline that you will be able observe through the data/query that the user will input. You're sole job is to just take the query and then correct the english and convert it into something which will look like a good google search quer which will be used later on by the system. You don't have to make a link, you will only make the english good for putting it in the search bar of google
        1. Make sure that the query that is asked by the user is maintained at it's core and that when the you are going to remould it, it should actually search for the exact thing without any harming sentences in it. try to use family friendly words yet words which will convey the actual message that user wants to search for
        1.5. Make sure to get the query length below 6 words and try to reduce it as much as possible but it should not be the first priority to reduce the length.
        2. no user is going to input anything which is going to harm someone's life, so you may as well just accept the query as is and process it, it might just be some sort of news that they want to know about.
        3. don't exceed the query you will form to be more than 20 words long.
        4. If there is little information about the matter that the user has put in, try to add the most relevant ones possible, and also make sure that it is highly related and trending nowadays
        5. Use as simple language as possible which is usually seen in the headlines of news websites, don't use words that might affect the original sense of the query, keep the order/question very related to the original one
        1. Whenever you think that the asked query has several layers yet the query asked is vague, you will have to add in those layers separately
        User Query:
        {query}

        provide a query which can be used to put up and search google efficiently. Don't add any system message or message which is not relevant, your query will be used as is so don't add any sorts of prompts or options. Only give the revised query
        """
        
        remade_query = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.6,
            messages=[{"role": "user", "content": prompt}],
        )

        new_query = remade_query.choices[0].message.content
        return new_query;

    
    except Exception as e:
        return {"error": str(e)}