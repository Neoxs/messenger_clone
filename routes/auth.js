const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const authController = require("../controllers/auth");



//handling requests
router.get("/login", (req, res) => {
	res.send({ error: req.flash("loginMessage")[0] });
});

router.post(
	"/login",
	passport.authenticate("local", {
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
				return res.redirect("/");
			}
		});
	}
});



router.post("/register", authController.postSignup);


module.exports = router;