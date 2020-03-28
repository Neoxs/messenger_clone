const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const authController = require("../controllers/auth");



//handling requests
router.get("/login", (req, res) => {
	res.render('auth/login',{ error: req.flash("loginMessage")[0], isAuthenticated: req.isAuthenticated() });
});

router.post(
	"/login",
	passport.authenticate("local", {
		successRedirect: "/chat",
		failureRedirect: "/login",
		failureFlash: true,
	})
);

router.post("/logout", (req, res, next) => {
	if (req.session) {
		req.logOut();
		res.clearCookie("connect.sid", { path: "/" });
		req.session.destroy(err => {
			if (err) {
				next(err);
			} else {
				return res.redirect("/login");
			}
		});
	}
});



router.post("/register", authController.postSignup);

router.get('/register', (req, res) => {
	res.render('auth/signup',{ error: req.flash("registerMessage")[0], isAuthenticated: req.isAuthenticated() });
})


module.exports = router;