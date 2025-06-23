const express = require("express");
const session = require("express-session");
const path = require("path");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 3000;

// Firebase Admin SDK
const serviceAccount = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"webapp")));
app.use(session({
  secret: "secret_key",
  resave: false,
  saveUninitialized: false,
}));

// Routes
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "webapp","login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "webapp","signup.html"));
});

app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname,"webapp", "dashboard.html"));
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  res.sendFile(path.join(__dirname, "webapp","index.html"));
});


// Signup Route 
app.post("/signup", async (req, res) => {
  const { email, password, name, username } = req.body;
  if (email && password && name && username) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.collection("users").add({
        email,
        password: hashedPassword,
        name,
        username,
        createdAt: new Date(),
      });

      req.session.user = { email, name };
      res.redirect("/login");
    } catch (error) {
      console.error("Error saving user:", error);
      res.redirect("/signup");
    }
  } else {
    res.redirect("/signup");
  }
});

// Login Route 
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const usersSnapshot = await db.collection("users").where("email", "==", email).get();

    if (usersSnapshot.empty) {
      return res.redirect("/login");
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    const isPasswordMatch = await bcrypt.compare(password, userData.password);
    if (!isPasswordMatch) {
      return res.redirect("/login");
    }

    req.session.user = { email: userData.email, name: userData.name };
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    res.redirect("/login");
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

