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

var userDatabase = {
  "milkmant": {
    id: "milkmant",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "shadow88": {
    id: "shadow88",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
};
// let cookieInfo = {
//   'username': req.cookies["username"],
// };


//All GET HTTP Requests
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/register', (req, res) => {
  res.render('registration');
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
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { importedDatabase: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});


// All POST HTTP Requests
app.post('/register', (req, res) => {
  var userIdGenerated = generateRandomString(10);
  userDatabase[userIdGenerated] = {};
  userDatabase[userIdGenerated]['id'] = userIdGenerated;
  userDatabase[userIdGenerated]['email'] = req.body.email;
  userDatabase[userIdGenerated]['password'] = req.body.password;
  res.cookie('user_id', userIdGenerated);
  res.redirect('/urls');
  // console.log('the user database:', userDatabase);
});


app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(301, req.params.id);
});

app.post("/urls", (req, res) => {
  var idGenerated = generateRandomString(6);
  urlDatabase[idGenerated] = req.body.longURL;
  res.redirect(`/urls/${idGenerated}`);
});


//Extra Functionality
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(num) {
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var outPut = '';
    for (i = 0; i < num; i++) {
    var character = possible.charAt(Math.floor(Math.random() * possible.length));
    outPut += character;
  }
  return outPut;
}