const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs')

// Middleware For Cookie Encryption
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secretwordthatencryptsallthepasswords'],

// Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// Database Of Shortened URLs
let urlDatabase = {
  'b2xVn2': {
    url: 'http://www.lighthouselabs.ca',
    urlCreator: 'example',
  },
  '9sm5xK': {
    url: 'http://www.google.com',
    urlCreator: 'example',
  },
};

// Database Of Users
let userDatabase = {
  'example': {
    id: 'example',
    email: 'admin@example.com',
    password: 'example',
  },
};

// All GET HTTP Listeners
app.get('/', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }
});

app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }
  res.render('login');
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }
  res.render('registration');
});

app.get('/u/:shortURL', (req, res) => {
  if (req.params.shortURL !== urlDatabase[req.params.shortURL]) {
    res.send('<h2>No Such Shorten URL Exists</h2>');
  }
  res.redirect(urlDatabase[req.params.shortURL].url);
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
  let templateVars = { userAsAnObject: userDatabase[req.session.user_id] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    res.send('<h2>You Are Not Logged In</h2><a href="/login">Visit Login Page</a>');
    return;
  }
  if ([req.params.id] === 'new') {
    res.redirect('/new');
  }
  if (!urlDatabase[req.params.id]) {
    res.send('<h2>No ShortURL Exists For /u/' + [req.params.id] + '</h2><a href="/urls">Visit Dashboard</a>');
    return;
  }
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], userAsAnObject: userDatabase[req.session.user_id] };
  res.render('urls_show', templateVars);
});

app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.send('<h2>You Are Not Logged In</h2><a href="/login">Visit Login Page</a>');
    return;
  }
  let templateVars = { importedDatabase: urlsForUser(req.session.user_id), userAsAnObject: userDatabase[req.session.user_id] };
  res.render("urls_index", templateVars);
});


// All POST HTTP Requests
app.post('/register', (req, res) => {
  for (user in userDatabase) {
    if (req.body.email === userDatabase[user].email) {
      res.send('<h2>A User With That E-Mail Already Exists</h2><a href="/register">Visit Registration Page</a>');
      return;
    }
  }
  if (!req.body.email || !req.body.password) {
    res.send('<h2>You Forgot To Input A Username Or E-Mail</h2><a href="/register">Visit Registration Page</a>');
    return;
  } else {
    // Creates User And Gives Them Encrypted Session Cookie
    let userIdGenerated = generateRandomString(10);
    userDatabase[userIdGenerated] = { id: userIdGenerated, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
    req.session.user_id = userIdGenerated;
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  for (key in userDatabase) {
    if (req.body.email === userDatabase[key].email) {
      if (bcrypt.compareSync(req.body.password, userDatabase[key].password)) {
        req.session.user_id = userDatabase[key]['id'];
        res.redirect('/urls');
        return;
      }
    }
  }
  res.send('<h2>No Account Exists With That E-Mail</h2><a href="/login">Visit Login Page</a>');
  return;
});

app.post('/logout', (req, res) => {
  req.session = null
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  if (!req.session.user_id) {
    res.send('<h2>You Are Not Logged In, You Cannot Delete A ShortURL</h2><a href="/login">Visit Login Page</a>');
    return;
  }
  if (urlDatabase[req.params.id].urlCreator === req.session.user_id) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.send('<h2>You Cannot Delete A ShortURL You Did Not Create</h2>')
    return;
  }
});

app.post('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    res.send('<h2>You Are Not Logged In, You Cannot Update A ShortURL</h2><a href="/login">Visit Login Page</a>');
    return;
  }
  if (urlDatabase[req.params.id].urlCreator === req.session.user_id) {
    let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
    urlDatabase[req.params.id].url = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.send('<h2>You Cannot Update A Short URL You Did Not Create');
    return;
  }
});

app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.send('<h2>You Are Not Logged In</h2><a href="/login">Visit Login Page</a>');
    return;
  }
  let idGenerated = generateRandomString(6);
  urlDatabase[idGenerated] = { url: req.body.longURL, urlCreator: req.session.user_id };
  res.redirect(`/urls/${idGenerated}`);
});


// Console Logged Startup Message
app.listen(PORT, () => {
  console.log(`TinyApp Up And Listening On Port ${PORT}!`);
});

// Random String Generator For UserIDs and ShortURL Names
function generateRandomString(num) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let outPut = '';
    for (i = 0; i < num; i++) {
    let character = possible.charAt(Math.floor(Math.random() * possible.length));
    outPut += character;
  }
  return outPut;
}

// Takes In A User ID And Returns An Object That Is A List Of The URLs In The Database The User Has Created
function urlsForUser(userFilter) {
  let filteredList = {};
  for (key in urlDatabase) {
    if (urlDatabase[key]['urlCreator'] === userFilter) {
      filteredList[key] = urlDatabase[key];
    }
  }
  return filteredList;
}