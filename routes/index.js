const express = require("express");
const router = express.Router();
const passport = require("passport");
var User = require("../models/user");

//root route
router.get("/", (req, res) => {
	res.render("landing");
});

// ========================
// AUTH ROUTES
// ========================

//SHOW REGISTER FORM
router.get("/register", (req, res) => {
	res.render("register");
});
//Handle signup logic
router.post("/register", (req, res) => {
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, (err, user) => {
		if(err){
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, () => {
			req.flash("success", "Welcome to YelpCamp, " + user.username);
			res.redirect("/campgrounds");
		});
	});
});

//Show login form
router.get("/login", (req, res) => {
	res.render("login");
});
//handle login logic
router.post("/login", passport.authenticate("local", {
	failureRedirect: "/login",
	failureFlash: "Invalid username or password"
}), (req, res) => {
	req.flash("success", "Welcome back to YelpCamp, " + req.user.username);
	res.redirect("/campgrounds");
});

//logout rout
router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/campgrounds");
});

module.exports = router;