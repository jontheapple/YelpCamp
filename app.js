const express = require("express")
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Comment = require("./models/comment");
const seedDB = require("./seeds");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const methodOverride = require("method-override");
const flash = require("connect-flash");

//requiring routes
const commentRoutes = require("./routes/comments");
const campgroundRoutes = require("./routes/campgrounds");
const indexRoutes = require("./routes/index");

// mongoose.connect("mongodb://localhost/yelp_camp_v12", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
mongoose.connect(process.env.DATABASEURL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

console.log(process.env.PORT);

//lets you method override, bc html forms can't do things other than get and post requests
app.use(methodOverride("_method"));
//use flash messages, needs to come before passport config
app.use(flash());
// seedDB(); //seed the database

//PASSPORT CONFIG
app.use(require("express-session")({
	secret: "Umi is sooooooooooo ccool",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Makes "currentuser" available in every template (ejs file)
//req.user is given by user.js : userSchema.plugin(passportLocalMongoose);
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

//allows shorter route names
app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

app.listen(process.env.PORT, process.env.IP, () => {
	console.log("Yelpcamp has started");
});