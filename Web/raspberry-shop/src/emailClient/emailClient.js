const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const emailUsers = {
  "admin@raspberryshop.com": {
    password: crypto.randomBytes(30).toString("hex"),
    emails: [],
  },
};

router.get("/", (req, res) => {
  if (req.session.EmailSession.loggedin) {
    res.redirect("/mail/inbox");
  } else {
    res.redirect("/mail/login");
  }
});

router.get("/login", (req, res) => {
  if (req.session.EmailSession.loggedin) {
    res.redirect("/mail/inbox");
  } else {
    res.render("emailLogin", { message: "" });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (emailUsers[email] && emailUsers[email].password === password) {
    req.session.EmailSession.loggedin = true;
    req.session.EmailSession.email = email;
    res.redirect("/mail/inbox");
  } else {
    res.render("emailLogin", { message: "Invalid email or password." });
  }
});

router.get("/register", (req, res) => {
  res.render("emailRegister", { message: "" });
});

router.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (emailUsers[email]) {
    res.render("emailRegister", { message: "Email already exists." });
  } else {
    emailUsers[email] = {
      password,
      emails: [],
    };
    res.redirect("/mail/login");
  }
});

router.get("/logout", (req, res) => {
  req.session.EmailSession = {};
  res.redirect("/mail/login");
});

router.get("/inbox", (req, res) => {
  if (req.session.EmailSession.loggedin && req.session.EmailSession.email) {
    const user = emailUsers[req.session.EmailSession.email];
    if (user) {
      res.render("emailInbox", {
        email: req.session.EmailSession.email,
        emails: user.emails,
      });
    } else {
      res.render("emailInbox", { emails: [] });
    }
  } else {
    res.redirect("/mail/login");
  }
});

module.exports = { router, emailUsers };
