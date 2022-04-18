const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//Add sessions
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const QueryString = require("querystring");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

app.use(express.static(__dirname + "/private"));


app.listen(3000, function () {
    console.log("server started at 3000");
});

//Initialize passport
app.use(session({
    secret: "alongsecretonlyiknow_asdlfkhja465xzcew523",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//Configure Mongoose
mongoose.connect('mongodb://localhost:27017/extractiveDB', {useNewUrlParser: true, useUnifiedTopology: true});

const publicationSchema = {
    title: String,
    publish_date: String,
    location: String,
    summary: String,
    link: String,
}

const Publication = mongoose.model('Publication', publicationSchema)

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        require: true,
        minlength: 3
    },
    password: {
        type: String,
        require: true,

    },
    fullname: {
        type: String,
        require: true,

    },
    role: {
        type: String,
        default: "user"
    }
})
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//get for home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
})
//get our team page
app.get('/our-team', (req, res) => {
    res.sendFile(__dirname + "/public/team.html");
})

app.get('/about', (req, res) => {
    res.sendFile(__dirname + "/public/about.html")
})


//get the current user
app.get('/get_current_user', function (req, res) {
    if (req.isAuthenticated()) {
        res.send({
            message: "success",
            data: req.user
        })
    } else {
        res.send({
            message: "user not found",
            data: {}
        })
    }
});


//register users page
app.get('/register', (req, res) => {
    if (req.query.error) {
        res.redirect("/register.html?error=" + req.query.error);
    } else {
        res.redirect("/register.html");
    }
});

app.post('/register', (req, res) => {
    const newUser = {
        username: req.body.username,
        fullname: req.body.fullname
    }
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err)
            res.redirect("/register/?error=" + err);
        } else {
            console.log(user)
            const authenticate = passport.authenticate('local')
            authenticate(req, res, () => {
                res.redirect('/')
            })
        }
    })

});

app.get('/login', (req, res) => {
    if (req.query.error) {
        res.redirect("/login.html?error=" + req.query.error);
    } else {
        res.redirect("/login.html");
    }
});

app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, err => {
        if (err) {
            res.redirect("/login?err=User name does not exist")
        } else {
            const authenticate = passport.authenticate('local', {
                successRedirect: "/",
                failureRedirect: "/login?error= username or password does not match"
            })
            authenticate(req, res);
        }
    })
});


app.get('/logout', (req, res) => {
    req.logout();
    res.redirect("/");
});
app.get('/get-edit-Publication',(req, res)=>{
    if(req.isAuthenticated() && req.user.role === 'admin'){
        res.sendFile(__dirname+'/private/editPublication.html')
    }else{
        res.redirect('/')
    }
})
app.get('/get-publicaitonListAdmin',(req, res)=>{
    if(req.isAuthenticated() && req.user.role === 'admin'){
        res.sendFile(__dirname+'/private/PublicationListAdmin.html')
    }else{
        res.redirect('/')
    }
})

app.get('/get-admin-portal',(req, res)=>{
    if(req.isAuthenticated() && req.user.role === 'admin'){
        res.sendFile(__dirname+'/private/admin_portal.html')
    }else{
        res.redirect('/')
    }
})



//this route splits user views on publications, one for admin and one for normal user
app.get('/view-publications', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        res.redirect('/get-admin-portal')
    } else if (req.isAuthenticated() && req.user.role === 'user') {
        res.redirect('PublicationList.html');
    } else {
        res.redirect('/')
    }
})

//allows both users and admins to retrieve the publications list.
app.get('/get-all-publications', (req, res) => {
    Publication.find((err, data) => {
        if (err) {
            res.send({
                "message": "internal database error",
                "data": []
            });
        } else {
            res.send({
                "message": "success",
                "data": data//.slice(0,5)
            })
        }
    })
})

app.get('/get-publication-by-id',
    function (req, res) {
        // console.log(req.query.movie_id);
        console.log(req.query.publication_id);
        Publication.find({"_id": req.query.publication_id}, function (err, data) {
            if (err || data.length === 0) {
                res.send({
                    "message": "internal database error",
                    "data": {}
                });
            } else {
                res.send({
                    "message": "success",
                    "data": data[0]
                })
            }
        });
    });


app.post('/save-publication', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        console.log(req.body.publish_date)
        const publication = {
            title: req.body.title,
            publish_date: req.body.publish_date,
            location: req.body.location,
            summary: req.body.summary,
            link: req.body.link,
        }
        console.log(req.body._id);
        if (req.body._id) {
            Publication.updateOne({_id: req.body._id},
                {$set: publication},
                {runValidators: true},
                (err, info) => {
                    if (err) {
                        res.redirect('/edit_publication.html?error_message=' + err.message + "&input=" + JSON.stringify(publication) + "&publication_id=" + req.body._id)
                    } else {
                        res.redirect('/get-publicaitonListAdmin')
                        //res.redirect("/movie_detail.html?movie_id=" + req.body._id)
                    }
                }
            )
        } else {
            const np = new Publication(publication);
            np.save((err, new_publication) => {
                if (err) {
                    console.log(err)
                    res.redirect('/edit_publication.html?error_message=' + err.message + "&input=" + JSON.stringify(publication))
                } else {
                    console.log(new_publication._id);
                    //res.redirect("/movie_detail.html?movie_id=" + new_movie._id)
                    res.redirect('/get-publicaitonListAdmin')
                }
            })
        }
    } else {
        res.redirect('/')
    }
})
app.post('/delete-publication-by-id', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        Publication.deleteOne(
            {"_id": req.body._id},
            {},
            (err) => {
                if (err) {
                    res.send({
                        "message": "database deletion error"
                    })
                } else {
                    res.send({
                        "message": "success"
                    })
                }
            }
        )
    }else{
        res.redirect('/');
    }
});
