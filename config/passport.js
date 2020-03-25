
const LocalStrategy = require("passport-local").Strategy;
const brcrypt = require("bcryptjs");
const passport = require("passport");

const User = require("../models/user");

//will put the id in the cookie
passport.serializeUser((user, done) => {
	done(null, user.id);
});

//search for the user using the id served by the cookie
passport.deserializeUser( async(id, done) => {
    try {
        const user = await User.findById(id)
        done(null, user)
    }catch(err) {
        done(err, null)   
    }
});

passport.use(
	new LocalStrategy(
		{
			passReqToCallback: true,
			usernameField: "email",
		},
		(req, email, password, done) => {
			//search for a user with the email
            User.findOne({email})
                .then(user => {
                    //console.log(user)
					if (!user) {
						return done(
							null,
							false,
							req.flash("loginMessage", "Wrong credentials")
						);
					}

					if (user) {
						brcrypt
							.compare(password, user.password)
							.then(isMatch => {
								if (!isMatch) {
									return done(
										null,
										false,
										req.flash(
											"loginMessage",
											"Wrong credentials2"
										)
									);
								} else {
                                    return done(null,
                                                user,
                                                req.flash(
                                                    "loginMessage",
                                                    "successful !"
                                                ));
								}
							});
					}
				})
				.catch(err => {
					return done(null, false, {
						message: "An error has occured, try again",
					});
				});
		}
	)
);

module.exports = passport;