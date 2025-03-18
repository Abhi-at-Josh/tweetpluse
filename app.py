from fastapi import FastAPI
import pickle
import pandas as pd
import re
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (You can restrict it later)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load trained model and vectorizer
try:
    model = pickle.load(open("trained_model.sav", "rb"))
    vectorizer = pickle.load(open("vectorizer.pkl", "rb"))
except FileNotFoundError:
    print("Error: Model or vectorizer file is missing.")
    exit()

# Initialize Stemmer
stemmer = PorterStemmer()

# Clean and Stem Function
def clean_and_stem(text):
    text = re.sub(r'http\S+|www\S+', '', text)  # Remove URLs
    text = re.sub(r'[^a-zA-Z\s]', '', text)  # Remove special characters
    text = text.lower().strip()
    return ' '.join([stemmer.stem(word) for word in text.split()])

# Function to Fetch Tweets Using Selenium
def fetch_tweets(username, tweet_count=10):
    url = f"https://twitter.com/{username}"
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # Run in the background
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.get(url)

    time.sleep(3)  # Allow time for tweets to load

    tweets = []
    scroll_attempts = 0

    while len(tweets) < tweet_count and scroll_attempts < 5:  # Ensure we get enough tweets
        page_tweets = driver.find_elements(By.CSS_SELECTOR, "article div[lang]")
        tweets = list(set([tweet.text for tweet in page_tweets]))  # Remove duplicates

        driver.find_element(By.TAG_NAME, "body").send_keys(Keys.PAGE_DOWN)  # Scroll
        time.sleep(2)  # Wait for new tweets to load
        scroll_attempts += 1

    driver.quit()
    
    return tweets[:tweet_count] if tweets else None

@app.get("/analyze_tweets")
def analyze_tweets(username: str):
    tweets = fetch_tweets(username, tweet_count=10)

    if tweets:
        df = pd.DataFrame({'text': tweets})
        df['stemmed_content'] = df['text'].apply(clean_and_stem)

        # Convert text to vector format for prediction
        X = vectorizer.transform(df['stemmed_content'])
        df['target'] = model.predict(X)  # Predict sentiment (0 = Negative, 1 = Positive)

        # Count positive and negative tweets
        positive_count = (df['target'] == 1).sum()
        negative_count = (df['target'] == 0).sum()
        
        total_tweets = len(df)
        positive_percentage = (positive_count / total_tweets) * 100
        negative_percentage = (negative_count / total_tweets) * 100

        return {
            "tweets": df.to_dict(orient="records"),
            "positive_percentage": positive_percentage,
            "negative_percentage": negative_percentage
        }
    
    return {"error": "No tweets found."}
