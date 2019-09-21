const express = require("express");
const router = express.Router();

const {
  emailExists,
  // userIdExists,
  validatePassword,
  addUser,
  createFriendlist
} = require("../bin/functions/helpers.js");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("email:", email);
  console.log("password:", password);
  try {
    const userInfo = await validatePassword(email, password);
    if (!userInfo) {
      throw new Error();
    }
    req.session.user_id = userInfo.id;
    return res.json({ user_id: userInfo.id, logged_in: true });
  } catch (err) {
    return res.json({ error: "Error. Credentials are incorrect." });
  }
});

router.get("/logout", (req, res) => {
  req.session.user_id = null;
  return res.json({ msg: "You have been logged out." });
});

router.get("/checkloggedin", async (req, res) => {
  try {
    if (!req.session.user_id) {
      throw new Error();
    }
    return res.json({ user_id: req.session.user_id, logged_in: true });
  } catch (err) {
    return res.json({ error: "Error. You are not logged in." });
  }
});

router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  console.log("info: ", username, email, password, confirmPassword);
  if (
    username === "" ||
    email === "" ||
    password === "" ||
    confirmPassword === ""
  ) {
    console.log("incorrect credentials");
    return res.json({ error: "Enter information in all fields." });
  }
  if (password !== confirmPassword) {
    console.log("passwords do not match");
    return res.json({ error: "Passwords must match." });
  }
  try {
    console.log("Here BEFORe tRYING", email);
    const foundUser = await emailExists(email);
    if (foundUser) {
      throw new Error();
    }
    console.log("I AM HERE :", email);
    const newUser = await addUser(username, email, password);
    const newFriendlist = await createFriendlist(newUser.id);
    console.log("NEW USEr ADDED HERE", newUser);
    console.log("New friendlist add", newFriendlist);

    req.session.user_id = newUser.id;
    console.log("I AM HERE3");

    return res.json({ user_id: newUser.id, logged_in: true });
  } catch (err) {
    return res.json({ error: "Error. Please retry" });
  }
});

module.exports = router;
