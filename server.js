// Dependencies
var express = require("express");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

// Express
var PORT = process.env.PORT || 8000;
var app = express();

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Handlebars as default engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Serve public files
app.use(express.static("public"));

// Connect to MongoDB
var databaseUri = "mongodb://localhost/news-scraper";
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
} else {
    mongoose.connect(databaseUri, { useNewUrlParser: true });
}

// Routes
// Home page
app.get("/", function(req, res) {
    db.Article.find({saved: false}).then(function(dbArticles) {
        res.render("home", {articles: dbArticles}); 
    }).catch(function(error) {
        console.log(error);
    });
});

// Get saved articles
app.get("/saved", function (req, res) {
    db.Article.find({saved: true}).then(function(savedArticles) {
        res.render("saved", {articles: savedArticles});
    }).catch(function(error) {
        console.log(error);
    });
});

// Scrape new articles
app.get("/scrape", function (req, res) {
    axios.get("https://www.digg.com").then(function (response) {
        var $ = cheerio.load(response.data);
        $(".digg-story").each(function (i, element) {

            var title = $(element).find("h2").text();
            var link = $(element).attr("data-contenturl");
            var summary = $(element).find(".digg-story__description").text();

            db.Article.create({
                title: title,
                link: link,
                summary: summary
            }).then(function(inserted) {
                res.redirect("/");
            }).catch(function(error) {
                console.log(error);
            });
        });
    });
});

// Clear database
app.get("/clear", function(req, res) {
    db.Article.deleteMany({}).then(function(deleted) {
    }).then(function(dbArticle) {
        return db.Note.deleteMany({});
    }).then(function(dbNote) {
        res.redirect("/");
    }).catch(function(error) {
        console.log(error);
    });
});

// Save article (update saved property to true)
app.put("/save/:id", function(req, res) {
    db.Article.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { saved: true } }
    )
      .then(function(saved) {
        res.json(saved);
      })
      .catch(function(error) {
        console.log(error);
      });
});

// Delete article
app.delete("/delete/:id", function(req, res) {
    db.Article.deleteOne({_id: req.params.id}).then(function(deleted) {
        res.json(deleted);
    }).catch(function(error) {
        console.log(error);
    });
});

// Save new note
app.post("/savenote/:id", function(req, res) {
    db.Note.create({ note: req.body.note }).then(function(
      dbNote
    ) {
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { notes: dbNote._id } },
        { new: true }
      )
        .then(function(dbArticle) {
          res.json(dbArticle);
        })
        .catch(function(error) {
          console.log(error);
        });
    });
});

// Delete note
app.delete("/deletenote/:id", function(req, res) {
    db.Note.deleteOne({_id: req.params.id}).then(function(deleted) {
        res.json(deleted);
    }).catch(function(error) {
        console.log(error);
    });
});

// Get notes by article
app.get("/notes/:id", function(req, res) {
    db.Article.findOne({_id: req.params.id}).populate("notes").then(function(dbArticle) {
        res.json(dbArticle);
    }).catch(function(error) {
        console.log(error);
    });
});

// Start the server
app.listen(PORT, function () {
    console.log("Listening on port " + PORT);
});