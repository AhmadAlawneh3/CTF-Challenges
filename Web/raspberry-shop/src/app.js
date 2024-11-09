const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const uuid = require("uuid");
const { router, emailUsers } = require("./emailClient/emailClient");

require("dotenv").config();
const FLAG = process.env.FLAG || "PWNSEC{Fake_Flag_For_Testing}";
let users = {};

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", ["./views", "./emailClient/views"]);
app.use("/images", express.static("./images"));

app.use(
  session({
    name: "session",
    secret: crypto.randomBytes(30).toString("hex"),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use((req, res, next) => {
  let { MainSession = {}, EmailSession = {} } = req.session;

  req.session.MainSession = MainSession;
  req.session.EmailSession = EmailSession;

  res.locals.mainLoggedin = MainSession.loggedin ? true : false;
  res.locals.EmailLoggedin = EmailSession.loggedin ? true : false;

  if (MainSession.loggedin) {
    res.locals.Message = `Contact you account manager for any help at <a href=\"mailto:${users[MainSession.email].manager}\">${users[MainSession.email].manager}</a>`
  } else {
    res.locals.Message = "© 2024 Raspberry Shop. All rights reserved.";
  }
  next();
});

app.get("/", (req, res) => {
  if (req.session.MainSession.loggedin) {
    res.redirect("/home");
  } else {
    res.redirect("/login");
  }
});

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
})

app
  .route("/login")
  .get((req, res) => {
    if (!req.session.MainSession.loggedin) {
      res.render("login");
    } else {
      res.redirect("/home");
    }
  })
  .post((req, res) => {
    const { email, password } = req.body;
    if (users[email] && users[email].password === password) {
      req.session.MainSession.loggedin = true;
      req.session.MainSession.email = email;
      req.session.MainSession.admin = users[email].admin || false;
      req.session.MainSession.manager = users[email].manager;
      res.redirect("/home");
    } else {
      res.render("login", { message: "Invalid email or password." });
    }
  });

  app
  .route("/register")
  .get((req, res) => {
    if (!req.session.MainSession.loggedin) {
      res.render("register");
    } else {
      res.redirect("/home");
    }
  })
  .post((req, res) => {
    const { email, password, passwordConfirmation } = req.body;

    if (users[email]) {
      res.render("register", { message: "Email already exists." });
    } else if (!password && !passwordConfirmation) {
      res.render("register", { message: "Password cannot be empty." });
    } else if (password !== passwordConfirmation) {
      res.render("register", { message: "Passwords do not match." });
    } else {
      // Create manager email
      const manager = `manager-${crypto.randomBytes(3).toString("hex")}@raspberryshop.com`;
      users[manager] = { password: crypto.randomBytes(30).toString("hex"), manager: null, admin: true ,token: null };
      // Create user and assign a manager
      users[email] = { password, manager: manager, admin: false ,token: null };
      // Add manager to emailUsers
      emailUsers[manager] = {
        password: crypto.randomBytes(30).toString("hex"),
        emails: [],
      }
      res.redirect("/login");
    }
  });


app.get("/logout", (req, res) => {
  req.session.MainSession = {};
  res.redirect("/login");
});

app
  .route("/reset-password")
  .get((req, res) => {
    const token = req.query.token;
    res.render("resetPassword", { token });
  })
  .post((req, res) => {
    const token = req.query.token;

    if (!token) {
      const email = req.body.email;

      if (users[email] && emailUsers[email]) {
        const resetToken = uuid.v1();
        users[email].token = resetToken;
        const resetLink = `${req.protocol}://${req.get("host")}${
          req.originalUrl
        }?token=${resetToken}`;

        const emailContent = {
          from: req.session.MainSession.manager,
          to: email,
          subject: "Password Reset",
          link: resetLink,
          timestamp: new Date(),
        };

        emailUsers[email].emails.push(emailContent);

        res.render("resetPassword", { message: "Email Sent." });
      } else {
        res.render("resetPassword", { message: "Email Sent." });
      }
    } else {
      const { password, password2 } = req.body;

      if (!password && !password2) {
        return res.render("resetPassword", {
          message: "Password cannot be empty.",
          token
        });
      }

      if (password === password2) {
        let validToken = false;
        for (let user in users) {
          if (users[user].token === token) {
            users[user].password = password;
            users[user].token = null;
            validToken = true;
            return res.render("login", {
              message: "Password reset successful.",
            });
          }
        }
        if (!validToken) {
          return res.render("resetPassword", {
            message: "Invalid or expired token.",
            token,
          });
        }
      } else {
        return res.render("resetPassword", {
          message: "Passwords do not match.",
          token,
        });
      }
    }
  });


app.get("/home", (req, res) => {
  if (req.session.MainSession.loggedin) {
    res.render("shop.ejs", {
      admin: req.session.MainSession.admin,
      flag: req.session.MainSession.admin ? FLAG : "",
      manager: req.session.MainSession.manager,
    });
  } else {
    res.redirect("/login");
  }
});

app.use("/mail", router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
