const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

var app = express();
var PORT = 8080; // default port 8080


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())


app.set("view engine", "ejs")


var urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    urlCreator: 'admin',
  },
  "9sm5xK": {
    url: "http://www.google.com",
    urlCreator: 'admin',
  },
};

var userDatabase = {
  'admin': {
    id: "admin",
    email: "admin@admin.com",
    password: "admin"
  },
};


//All GET HTTP Requests
app.get("/", (req, res) => {
  let templateVars = { userAsAnObject: userDatabase[req.cookies["user_id"]] };
  res.render('homepage', templateVars);
});



app.get("/testing", (req, res) => {
  let templateVars = { userAsAnObject: userDatabase[req.cookies["user_id"]] };
  res.render('testing', templateVars);
});



app.get("/login", (req, res) => {
  // let templateVars = { userAsAnObject: userDatabase[req.cookies["user_id"]] };
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('registration');
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].url);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect('/login');
    return;
  }
  let templateVars = { userAsAnObject: userDatabase[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], userAsAnObject: userDatabase[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { importedDatabase: urlsForUser(req.cookies["user_id"]), userAsAnObject: userDatabase[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});


// All POST HTTP Requests
app.post('/register', (req, res) => {
  for (user in userDatabase) {
    if (req.body.email === userDatabase[user].email) {
      res.status(400);
      res.render('registration')
      return;
    }
  }
  if (!req.body.email || !req.body.password) {
      res.status(400);
      res.render('registration');
      return;
  } else {
    var userIdGenerated = generateRandomString(10);
    userDatabase[userIdGenerated] = {};
    userDatabase[userIdGenerated]['id'] = userIdGenerated;
    userDatabase[userIdGenerated]['email'] = req.body.email;
    userDatabase[userIdGenerated]['password'] = req.body.password;
    console.log(userDatabase);
    res.cookie('user_id', userIdGenerated);
    res.redirect('/urls');
    }
});


app.post("/login", (req, res) => {
  //Looks For User In Database Iterating Over All User
  for (user in userDatabase) {
    if (req.body.email === userDatabase[user].email) {
      if (req.body.password === userDatabase[user].password) {
        res.cookie('user_id', userDatabase[user].id);
        res.redirect('/');
        return;
  //Proper Username But Incorrect Password
      } else {
        res.status(403);
        res.render('login');
        return;
      }
    } else {
      //Couldn't Find User
      res.status(403);
      res.render('login');
      return;
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].urlCreator === req.cookies['user_id']) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    console.log('CANT DELETE THIS');
    res.status(403);
    res.redirect('/urls');
  }
});

app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].urlCreator === req.cookies['user_id']) {
    let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
    urlDatabase[req.params.id].url = req.body.longURL;
    res.redirect(301, req.params.id);
  } else {
    console.log('CANT EDIT THIS');
    res.status(403);
    res.redirect(req.params.id);
  }
});

app.post("/urls", (req, res) => {
  var idGenerated = generateRandomString(6);
  urlDatabase[idGenerated] = { url: req.body.longURL, urlCreator: req.cookies['user_id'] };
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

function urlsForUser(userFilter) {
  var filteredList = {};
  for (key in urlDatabase) {
    if (urlDatabase[key]['urlCreator'] === userFilter) {
      filteredList[key] = urlDatabase[key];
    }
  }
  return filteredList;
}