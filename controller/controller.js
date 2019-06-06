//GETTING THE FILES AND MODS WE NEED
var express = require("express");
var router = express.Router();
var path = require("path");
//for scraping
var request = require("request");
var cheerio = require("cheerio");
//connecting to our models
var Comment = require("../models/Comment.js");
var Article = require("../models/Article.js");

//Dealing with routes
//redirecting to index
router.get("/", function(req, res) {
  res.redirect("/articles");
});

//Redirecting to scrape
router.get("/scrape", function(req, res) {
  request("https://www.foxnews.com", function(error, response, html) {
    //load info into cheerio and save into selector
    var $ = cheerio.load(html);
    var titlesArray = [];

    $(".c-entry-box--compact__title").each(function(i, element) {
      var result = {};
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      //checking for empties and duplicates before pushing into database
      if (result.title !== "" && result.link !== "") {
        if (titlesArray.indexOf(result.title) == -1) {
          titlesArray.push(result.title);
          Article.count({ title: result.title }, function(err, test) {
            if (test === 0) {
              var entry = new Article(result);
              entry.save(function(err, doc) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(doc);
                }
              });
            }
          });
        } else {
          console.log("Article already exists.");
        }
      } else {
        console.log("Not saved to DB, missing data");
      }
    });
    res.redirect("/");
  });
});

//Redirecting to articles
router.get("/articles", function(req, res) {
  Article.find()
    .sort({ _id: -1 })
    .exec(function(err, doc) {
      if (err) {
        console.log(err);
      } else {
        var artcl = { article: doc };
        res.render("index", artcl);
      }
    });
});

//Redirecting to articles-json
router.get("/articles-json", function(req, res) {
  Article.find({}, function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      res.json(doc);
    }
  });
});

//Creating route to clear all the articles
router.get("/clearAll", function(req, res) {
  Article.remove({}, function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log("removed all articles");
    }
  });
  res.redirect("/articles-json");
});

//read article link
router.get("/readArticle/:id", function(req, res) {
  var articleId = req.params.id;
  var hbsObj = {
    article: [],
    body: []
  };

  Article.findOne({ _id: articleId })
    .populate("comment")
    .exec(function(err, doc) {
      if (err) {
        console.log("Error: " + err);
      } else {
        hbsObj.article = doc;
        var link = doc.link;
        request(link, function(error, response, html) {
          var $ = cheerio.load(html);

          $(".l-col__main").each(function(i, element) {
            hbsObj.body = $(this)
              .children(".c-entry-conent")
              .children("p")
              .text();

            res.render("article", hbsObj);
            return false;
          });
        });
      }
    });
});

//adding route to the comment section
router.post("/comment/:id", function(req, res) {
  var user = req.body.name;
  var content = req.body.comment;
  var articleId = req.params.id;

  var commentObj = {
    name: user,
    body: content
  };

  var newComment = new Comment(commentObj);

  newComment.save(function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log(doc._id);
      console.log(articleId);

      Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { comment: doc._id } },
        { new: true }
      ).exec(function(err, doc) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/readArticle/" + articleId);
        }
      });
    }
  });
});

module.exports = router;