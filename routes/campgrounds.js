const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");

//INDEX - show all campgrounds
router.get("/", (req, res) => {
	//Get all campgrounds from DB
	Campground.find({}, (err, allCampgrounds) => {
		if (err){
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user});
		}
	});
});

//CREATE - create new campgrounds
router.post("/", middleware.isLoggedIn, (req, res) => {
	// get data from form and add to campgrounds array
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {name: name, image: image, description: description, author: author, price: price};
	//Create a new campground and save to db
	Campground.create(newCampground, (err, newlyCreated) => {
		if (err){
			console.log(err);
		} else{
			// redirect back to campgrounds page
			res.redirect("/campgrounds");
		}
	})
});

//NEW - show form
router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
router.get("/:id", (req, res) => {
	//find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) =>{
		if (err || !foundCampground){
			req.flash("error", "Campground not found");
			res.redirect("back");
		} else {
			//render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

//EDIT
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});
//UPDATE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	//find and update correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
		if(err){
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
	//redirect somewhere
});

//DESTROY campground route
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	//delete comments
	Campground.findById(req.params.id, (err, foundCampground) => {
		if (err){
			console.log(err)
		} else {
			for (var comment of foundCampground.comments){
				Comment.findByIdAndDelete(comment, (err) =>{
					if (err){
						console.log(err);
					}
				});
			}
		}
	});
	//delete Campground
	Campground.findByIdAndDelete(req.params.id, (err, campgroundRemoved) => {
		if (err) {
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	});
});

module.exports = router;