import sys, os
from selenium import webdriver

url = sys.argv[1]
savein = sys.argv[2]

print("Saving url " + url + " in file " + savein)

chromedriver = '/usr/lib/chromium-browser/chromedriver'
os.environ['webdriver.chrome.driver'] = chromedriver
webdriver = webdriver.Chrome(chromedriver)
webdriver.get(url)
webdriver.get_screenshot_as_file(savein)
