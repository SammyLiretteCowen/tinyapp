const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

var app = express();
var PORT = 8080; // default port 8080


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())


app.set("view engine", "ejs")


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// let cookieInfo = {
//   'username': req.cookies["username"],
// };

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  // console.log(urlDatabase);
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(301, req.params.id);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  var idGenerated = generateRandomString();
  urlDatabase[idGenerated] = req.body.longURL;
  res.redirect(`/urls/${idGenerated}`);
});

app.get("/urls", (req, res) => {
  let templateVars = { importedDatabase: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var outPut = '';
    for (i = 0; i < 6; i++) {
    var character = possible.charAt(Math.floor(Math.random() * possible.length));
    outPut += character;
  }
  return outPut;
}

//ttest