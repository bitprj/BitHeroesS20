# Content-Analysis-Chrome-Extension
Chrome extension that examines articles via Azure Functions. Analysis ranges from article sentiment to text difficulty. To use, upload file onto chrome://extension developer mode. Alternatively, run on local host and open googleExtensionFiles/popup.html.

# A 20 Minute Blog/Rant on The World's Most Convoluted Google Extension

Greetings! Are you a plebeian tired of having your emotions ruled by the Shadow Lizard Illuminati? 
Wouldn't it be great if you, just for once, flex on BIG TECHNOLOGY by exposing the hidden secrets they have woven into the words you read online? 
Wouldn't it be nice if you can have an illusion of control to help cope with the unstoppable force of entropy and the inevitable heat death of the universe?
Wouldn't it be amazing if you could replace our evil *itallics Human Overlords*, and replace them with Robot Overlords instead?

Well dear reader, I'm afraid you'll have to wait another day for the glorious hivemind revolution. In the meantime, allow me to introduce you to the predecessor to the greatest program of all time, "The Content Analyzer" (trademark pending). 

This revoutionary spaghetti code will stumble into your lovely heart by doing something pretty nharly. 
This bad boi is a chrome extension that's able to look over the website you're reading and dish out analytics on the sentiment (Fig. 1), difficulty (Fig. 2), and the freakin' political leaning of the text (Fig. 3). The program even spits out semi-related articles somtimes (Fig. 4). 

-- fig 1 - 4

Hi, my name is Jesse Lee and I lowkey hate myself. That's why I decided to make this god-forsaken Google Chrome Extension, the most extra and convuluted thing in the concievable universe. Want proof of my degeneracy? Just look at this stupid flowchart:
-- flow chart here, idk how
(caption) It's not just dummy thicc. It's dummy.

If you're a self-respecting human, you probably don't care about how this program works. With that said, allow me to explain how this program works. 

Basically, this program works by being fabulous. Or more acurrately, by being F.H.A.B. (the h is silent). Or even more acurrately, by implementing a F.H.A.B. structure. Or most acurrately but significantly less-cool-soundingly, by implementing a Frontend that makes a HTTP Request Trigger to an Azure Function Backend. The next couple of sections shall examine the story of how this program works. Afterwards, the tools and stuff to make this project work will be explored in detail, so you can also suffer the same pain I did.

## Google Chrome Extension
This program would not be possible if not for Google Extensions. First, the program loads up an html file, popup.html, which serves as a visual interface. The background script, popup.js then loads. This is what creates the graphs in the program. The graphs are created by the popular javascript library, Chart.js. As the program is a Google Extension, it requires a special file, manifest.json. This file details logistics to the Google Chrome browser. Additionally, this file enables us to get permissions to certain user information that we can sell in the black market. In our case, all we require is the permission, tabs, which allows us to get the url of the user's active tab.

## Frontend (Buttons)
To get the graph to do its magic, The frontend communicates with the backend via an HTTP Request Trigger, which activates everytime someone presses the "Get" button. When this button is pressed, a frontend script activates and starts to anaylze whatever the current type is. The type starts off with Sentiment, but can be adjusted via the "Switch" button, which uses 2 variables (an array and an index) to get the type of analysis. Finally, the "Search" button sets a variable to 1 or 0. This variable will be passed as a param in the HTTP trigger to determine whether phrases should be extracted from the text. We'll discuss this particular button later in the tutorial. In the meantime, let's use our wonderful imagination and imagine that I pressed the "Search" button and also pressed the "Get" button on this very long article. As soon as I press this button, the url is taken from the tab and passed as an argument into our first Azure Function caller.

## Frontend (analyseFunction())
To understand how this terribly designed function works, there's a couple of things  we gotta understand. First, let's discuss what Azure Function and HTTP Triggers are. Basically, Azure Functions are these cloud computing thingys that allow you to do backend stuff without worrying about managing a physical server. These functions are called in a variety of ways, from an HHTP Tigger (GET request) to Timing Based. Our function is activated via an HTTP Trigger. In this particular function, there are 4 params (name, analysis, phrases, cycle) that are needed to be added to the endpoint to get stuff crackin'. 

But before we discuss what each of the 4 params signify, there are 2 issues we gotta discuss first. One is the the idea of bottleneck, and the other is the idea of HTTP Responses. Bottlenecks are basically limitations given based on APIs we are using. In this program, there is a 10 item and 5120 character limit for each request on the sentiment analysis and phrase extraction APIS. Basically, this limit comes at play whenever we are trying to analyze a larger document. In order to bypass this problem, we can cut down long documents into digestable chunks for the API. However, we run into a second issue, limitations of HTTP Responses. Basically, an HTTP Response is what's given to a user when you make an HTTP Request. The issue is, each HTTP Request can only get ine Response; you cannot update it overtime. With the contradiciton between bottleneck and HTTP Reponse, the way to solve this is through a special param to track this.

Aight, we can finally talk about the params. Name is just the current url, analysis is the type of analyze we want to perform, phrases is an integer that you set to 1 if you want the function to extract search phrases (more on that later), and cycle is the special param I mentioned above. Cycle tracks how far within the article you are through an updating integer value. We can consistently update cycle by putting it in a while loop. Instead of trying to get multiple HTTP Responses, we focus on making multiple function calls instead. When we examine the backend, we'll see how it works in greater detail. For now, just understand that cycle is the key to us not sucking.

So what does the HTTP trigger do anyways? Well, curious reader, it returns a json Object full of useful informational. Based on our current example, let's make an HTTP call to see what it returns. Just plop the endpoint + the params into your search bar and watch cool stuff happen.

Here's the request:
--hhtp trigger line

Here's the response:
--http trigger response

As you can see, the json data contains 3 distinct parts. First is value, which is a dictionary containing the results of the analysis. Then there's continue, which is a boolean value to let us know whether to continue running or not. This boolean value is what is used for in order to stop the while loop containing cycle. Finally, the phrases, which is a string full of key search words. The program uses value in order to update the chart.

After the function runs, the final result is written into the popup.html and ever value is reset to default.

Final sidenotes: This function is asynchronous, meaning the rest of the program can exceucte while waiting for the results to come bac. Additionally, a proxy url is called first; this is due to certain policies within google extensions, whcih barrs the function.

## Backend(WebScrape.py)
Let's finally talk about backend. To begin, once the params are passed over, they are utilized to update the values for the global variables. In the process, functions from the WebScrape.py file breaks the article down into chunks. The Python library, Newspaper (a more lightweight version of BeautifulSoup), takes in a url and returns a list. This list is then broken down by other functions until a analyzable list is created (right size). Below is the code used to acomplish this tasl, I'm gonna skip over the nitty gritty, cuz the logic and edge cases are super boring, even for me. 


## Backend(OOP & get_analytics)
After the unique document is generated, it's given to the get_analytics function to analyze. Unlike the frontend files, I actually did something pretty big brained and implemented an object class structure into my get_anaytics in order to get good. Basically, OOP, or object-orientated programming, is the idea of creating classes that share methods and attributes in order to save time. I implemented 2 big brained strats into this section to save time on designing and implementing future features. Look at this magical chart below, it details the relationship between my analyze types and a parent class of Analyze.
-- chart here

Essentially, I utilized the OOP concepts of Inheritance and Polymorphism to weasle out of writing conditional statements and seperate functions. By having a parental relation and overriding methods when needed, I can guarantee that a method does exist, even if I don't know the actual class. An example would be the a.analyse(client, document, i) line in the get_analytics function. Additionally, I utilized Inheritance in order to handle the get_phrases methods. This allows me to be able to create the get_phrases anywhere else, without being limited to this singular project.

## Backend(Analyze & key_phrase_list)
Speaking of get_phrases, let's talk about phrases really quick. To extract key phrases, I am using the Microsoft Text Analysis API, which is able to extract key phrases. The way the program is set up, the parent class, Analyze, possesses methods to help handle and shorten the list for phrases. These methods are only called when get_phrases (one of the params from the beginning), is true. Due to the nature of the API, extracting phrases often creates wayy too many to be utilized for search purposes. To solve this, I run the new list in the key phrase extract once. Proceeding this, in order to shorten key phrases to a more managable amount while also conserving resources, I utilize a random function to keep key phrases. Is that cheating? Perhaps. But you try paying for Azure products, stuff ain't cheap.

Analyze is a glorified abstract class. The only difference is that I added 2 actual methods to it last minute in order to create better code. By having Analyze handle key_phrase extraction, the code is a lot more concise and I can just call class objects for the functions.

## Backend(Sentiment)
Let us now examine each of the Analyze children classes, starting with Sentiment. Sentiment analysis works by using the Microsoft Text Analysis. Not much to not about it lol.

## Backend(Difficulty)
For this class, I just yoinked some code from stackoverflow to track sentences, words, and syllable counts. The difficulty analysis is based on the flesch reading test, which is pretty cool, high digits means it's easy, low digits means it's hard. You just plug stuff into a simple equation with some really janky numbers. The only thing to note is that I'm an idiot and my code should be slapped with a please do not try this at home sticker, as I tried to use self and cls in a class method. Basically, to keep it sweet and simple, this is terrible practice and I don't deserve rights.

## Backend(Leaning)
This class was easy to set up thanks to everything else. The API I'm using to measure politcal leaning is from the non-profit organization, Bi-Partisan Press. Super cool of them to give me access, it's pretty fun to play with this API. It's a simple POST request which gets you the politcal leaning of texts. -42 to 42, negatives indicate left leaning.

## Backend(get_json)
After analyzing everything, you set it to a variable dictionary, which is also a shared class method. Other than that, you just need to return the data as a JSON object, and reset all variables. The only other thing to note is that when the text list is empty, a function is called which sets the continue_running value (remember from wayyyy earlier) to false.

## Frontend(searchFunction)
After getting data from the backend and the analysis is completed, if the searchIndicator is true, then the phrases list will be converted into a string and passed into the another Azure Function. As we already discussed a lot already, I'll keep it brief. This function only has 3 params, 2 mandatory (the phrases and the original url) and 1 optional (number of search results to return)

## Backend(Azure Function 2)
In this Function, the bing news search engine API is called in order to get semi-relevant news based on the content. Then a json formatted data, containing the article name, article url, and article description is passed over to the frontend.

## Frontend(DONE)
You literally can't go one. You're done. The article information is displayed and that's literally it. You're done. You can see your family now. Thanks for sitting through hell with me.






