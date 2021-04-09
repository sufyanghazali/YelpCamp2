const User = require("../models/user");

module.exports = {

    renderRegister(req, res) {
        res.render("users/register");
    },

    renderLogin(req, res) {
        res.render("users/login");
    },

    async register(req, res) {
        try {
            const {email, username, password} = req.body;
            const user = new User({email, username});
            const registeredUser = await User.register(user, password);
            req.login(registeredUser, err => {
                if (err) {
                    next();
                } else {
                    req.flash("success", "Welcome to YelpCamp!");
                    res.redirect("/campgrounds");
                }
            });
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("register");
        }
    },

    loginRedirect(req, res) {
        req.flash("success", "Logged in!");
        const redirectUrl = req.session.returnTo || "/campgrounds";
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    },

    logoutRedirect(req, res) {
        req.logout();
        req.flash("success", "Logged out!");
        res.redirect("/campgrounds");
    }

}