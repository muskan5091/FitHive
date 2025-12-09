const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.getSignup = (req, res) => res.render('signup', { error: null });

exports.postSignup = async (req, res) => {
    const { fullname, email, password, confirmpassword } = req.body;

    if (!fullname || !email || !password || !confirmpassword)
        return res.render('signup', { error: "All fields are required." });

    if (password !== confirmpassword)
        return res.render('signup', { error: "Passwords do not match." });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ fullname, email, password: hashedPassword });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        if (err.code === 11000) {
            res.render('signup', { error: "Email already registered." });
        } else {
            console.error(err);
            res.render('signup', { error: "Something went wrong." });
        }
    }
};

exports.getLogin = (req, res) => res.render('login', { error: null });

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.render('login', { error: "Both email and password are required." });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.render('login', { error: "User not registered." });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.render('login', { error: "Incorrect password." });

        // Save user session
        req.session.userId = user._id;
        req.session.userName = user.fullname;
        req.session.userEmail = user.email;

        // ✅ Redirect to main homepage (index.ejs)
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('login', { error: "Something went wrong." });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) console.error(err);
        res.redirect('/login');
    });
};

exports.isLoggedIn = (req, res, next) => {
    if (req.session.userId) next();
    else res.redirect('/login');
};
