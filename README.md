# Mongo News Scraper
Homework #18 

## App Concept
Scrape the latest articles from Digg.com, save your favorites, and add saved comments to each saved article.

## Technologies Used
* Node.js
* Express.js
* Handlebars
* MongoDB
* Mongoose
* Axios
* Cheerio.js

**Features include:**
* Get the current articles on Digg.com using Cheerio.js and Axios
* Save articles and notes with Mongoose into a MongoDB
    * Save any article and it will be removed from the scraped list
    * Saved articles can be deleted from saved or have notes added to them
    * Each article can have multiple notes and individual notes can be deleted
* Clear out all articles from the scraped and saved lists

## Try the app here:

https://article-scraper-web.herokuapp.com/