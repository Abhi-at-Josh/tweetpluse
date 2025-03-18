from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

def scrape_tweets(username, tweet_count=10):
    url = f"https://twitter.com/{username}"

    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # Run in the background
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    driver.get(url)
    time.sleep(5)  # Wait for tweets to load

    tweets = driver.find_elements(By.CSS_SELECTOR, "article div[lang]")[:tweet_count]
    tweet_texts = [tweet.text for tweet in tweets]

    driver.quit()
    return tweet_texts

# Example Usage
username = input("Enter Twitter username (without @): ")
tweets = scrape_tweets(username)
print("\n".join(tweets) if tweets else "No tweets found.")
