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

// for easy, continuous deployment
require('dotenv').config();
const port = process.env.PORT // will be 8080 for the cloud
const db_url = process.env.DB_URL; 


//Initialize passport
app.use(session({
    secret: "alongsecretonlyiknow_asdlfkhja465xzcew523",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Configure Mongoose, and listen on the port, this is better for deployment
mongoose.connect(db_url, {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    app.listen(port, ()=>{
        console.log("Database connection is Ready "
        + "and Server is Listening on Port ", port);
    })
})
.catch((err)=>{
    console.log("A error has been occurred while"
        + " connecting to database.");   
})





const publicationSchema = {
    title: String,
    publish_date: String,
    location: String,
    summary: String,
    authors: String,
    image: String,
    link: String,
}

const Publication = mongoose.model('Publication', publicationSchema)

const eventsSchema = {
    title: String,
    image: String,
    summary: String,
    location: String,
    date: String,
    people: [{
        username: String,
        fullname: String,
    }
    ]
}
const Event = mongoose.model('Event', eventsSchema)


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
    },
    events: [
        {
            title: String,
            location: String,
            date: String
        }
    ]
})
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


const BlogpostSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
        minlength: 5
    },
    publish_date: {
        type: Date,
        default: Date.now(),
        require: true
    },
    author: String,
    text: {
        type: String,
        require: true,
        minlen: 20
    },
    image: String,
    comments: [{
        user: String,
        comment: {
            type: String,
            require: true,
            minlen: 1
        },
        date: {
            type: Date,
            default: Date.now(),
            require: true
        }
    }]
});

const Blogpost = mongoose.model('Blogpost', BlogpostSchema)

//get for home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
})
//get our team page
app.get('/our-team', (req, res) => {
    res.sendFile(__dirname + "/public/team.html");
})
// get about page
app.get('/about', (req, res) => {
    res.sendFile(__dirname + "/public/about.html")
})

//get user publication list
app.get('/publications', (req, res) => {
    res.sendFile(__dirname + "/public/PublicationList.html")
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
                res.redirect('/portal')
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
                successRedirect: "/portal",
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
            authors: req.body.authors,
            image: req.body.image,
        }
        console.log(req.body._id);
        if (req.body._id) {
            Publication.updateOne({_id: req.body._id},
                {$set: publication},
                {runValidators: true},
                (err, info) => {
                    if (err) {
                        res.redirect('/get-edit-publication?error_message=' + err.message + "&input=" + JSON.stringify(publication) + "&publication_id=" + req.body._id)
                    } else {
                        res.redirect('/admin-pub-list')

                    }
                }
            )
        } else {
            const np = new Publication(publication);
            np.save((err, new_publication) => {
                if (err) {
                    console.log(err)
                    res.redirect('/get-edit-publication?error_message=' + err.message + "&input=" + JSON.stringify(publication))
                } else {
                    res.redirect('/admin-pub-list')
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
    } else {
        res.redirect('/');
    }
});

// determine if person is an admin or client
app.get('/portal', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        res.sendFile(__dirname + '/private/admin_portal.html')
    } else if (req.isAuthenticated() && req.user.role === 'user') {
        res.sendFile(__dirname + '/private/userPortal.html');
    } else {
        res.redirect('/');
    }
})

//get the admin publication list
app.get('/admin-pub-list', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        res.sendFile(__dirname + '/private/PublicationListAdmin.html')
    } else {
        res.redirect('/');
    }
})

//get the edit publication form for admins
app.get('/get-edit-publication', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        res.sendFile(__dirname + '/private/editPublication.html')
    } else {
        res.redirect('/');
    }
})

/////////////////////events stuff below/////////////////////////
//get the public events page


app.get('/events', (req, res) => {
    res.sendFile(__dirname + "/public/EventList.html")
})

// get the events list for the user
app.get('/get-events-admin', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        res.sendFile(__dirname + '/private/adminListEvents.html')
    } else {
        res.redirect('/');
    }
})

// get the edit event form for the admin
app.get('/get-edit-event', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        res.sendFile(__dirname + '/private/editEvents.html');
    } else {
        res.redirect('/');
    }
})
//allow admins and users to get events

app.get('/get-all-events', (req, res) => {
    Event.find((err, data) => {
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

app.get('/get-event-by-id',
    function (req, res) {
        // console.log(req.query.movie_id);
        console.log(req.query.event_id);
        Event.find({"_id": req.query.event_id}, function (err, data) {
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


// create or edit a event for the admin
app.post('/save-event', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        console.log(req.body.publish_date)
        const event = {
            title: req.body.title,
            image: req.body.image,
            summary: req.body.summary,
            location: req.body.location,
            date: req.body.date
        }
        if (req.body._id) {
            Event.updateOne({_id: req.body._id},
                {$set: event},
                {runValidators: true},
                (err, info) => {
                    if (err) {
                        res.redirect('/get-edit-event?error_message=' + err.message + "&input=" + JSON.stringify(publication) + "&publication_id=" + req.body._id)
                    } else {
                        res.redirect('/get-events-admin')

                    }
                }
            )
        } else {
            const ne = new Event(event);
            ne.save((err, new_event) => {
                if (err) {
                    console.log(err)
                    res.redirect('/get-edit-event?error_message=' + err.message + "&input=" + JSON.stringify(publication))
                } else {
                    res.redirect('/get-events-admin')
                }
            })
        }
    } else {
        res.redirect('/')
    }
})
// delete a event
app.post('/delete-event-by-id', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        Event.deleteOne(
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
    } else {
        res.redirect('/');
    }
});

//rsvp things
app.post('/rsvp_event', (req, res) => {
    if (req.isAuthenticated()) {
        console.log('entered auth');
        const event = req.body.event;
        const user = req.user;
        //console.log(event)
        //console.log(user)
        User.updateOne({
                username: user.username,
                'events.title': {$ne: event.title}

            },
            {
                $push: {
                    events: event
                }
            },
            {},
            (err, info) => {
                if (err) {
                    res.send({
                        message: "database error"
                    })
                } else {

                }
            }
        )
        Event.updateOne(
            {
                _id: event._id,
                'people.username': {$ne: user.username}
            },
            {
                $push: {
                    people: user
                }
            },
            {},
            (err, info) => {
                if (err) {
                    res.send({
                        message: "database error"
                    })
                } else {
                    res.send({
                        message: "success"
                    })
                }
            }
        )
    } else {
        res.redirect('/login');
    }
})

app.post('/unrsvp_event', (req, res) => {
    if (req.isAuthenticated()) {
        const event = req.body.event;
        console.log(event)
        User.updateMany({

            },
            {
                $pull: {
                    events:{_id:event}
                }
            },
            {},
            (err, info) => {
                if (err) {
                    res.send({
                        message: "database error"
                    })
                } else {
                    res.send({
                        message:'success'
                    })
                }
            }
        )
    }
})

app.post('/user_unrsvp',(req, res) => {
    if (req.isAuthenticated()) {
        const event = req.body.event;
        const user = req.user
        console.log(user)
        User.updateOne({
                username: user.username,
            },
            {
                $pull: {
                    events:{_id:event}
                }
            },
            {},
            (err, info) => {
                if (err) {
                    res.send({
                        message: "database error"
                    })
                } else {
                    // res.send({
                    //     message:'success'
                    // })
                }
            }
        )
        Event.updateOne({
                _id: event,
            },
            {
                $pull: {
                    people:{username:user.username}
                }
            },
            {},
            (err, info) => {
                if (err) {
                    res.send({
                        message: "database error"
                    })
                } else {
                    res.send({
                        message:'success'
                    })
                }
            }
        )
    }
})

app.get('/guest-list',(req, res) => {
    if(req.isAuthenticated()&&req.user.role === 'admin'){
        res.sendFile(__dirname + '/private/guestList.html')
    }else{
        res.redirect('/');
    }
})
///////////////////// blog stuff below /////////////////////////
// the blog page route, admins will have access to the "add blog" page
app.get('/view-blog', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        res.redirect('blog.html' + "?add_button=true")
    } else if (req.isAuthenticated() && req.user.role === 'user') {
        res.redirect('blog.html');
    } else {
        res.redirect('blog.html'); // for non-logged in users
    }
})


app.get('/get-all-blogposts', (req, res) => {
    // sorts with the most recent posts at the top
    Blogpost.find({}).sort({publish_date: -1}).
        exec((err, data) => {
        if (err) {
            res.send({
                "message": "internal database error",
                "data": []
            });
        } else {
            res.send({
                "message": "success",
                "data": data //.slice(0,5)
            })
        }
    })
})


app.get('/get-edit-Blogpost', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        res.sendFile(__dirname + '/private/editBlogpost.html')
    } else {
        res.redirect('/')
    }
})

// save function for blogpost
app.post('/save-blogpost', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        console.log(req.body.title)
        const blogpost = {
            title: req.body.title,
            // publish date is Date.now() by default
            author: req.body.author,
            text: req.body.text,
            image: req.body.image
        }
        console.log(req.body._id);
        if (req.body._id) {
            Blogpost.updateOne({_id: req.body._id},
                {$set: blogpost},
                {runValidators: true},
                (err, info) => {
                    if (err) {
                        res.redirect('/get-edit-Blogpost?error_message=' + err.message + "&input=" + JSON.stringify(publication) + "&publication_id=" + req.body._id)
                    } else {
                        res.redirect('/get-edit-Blogpost')
                        //res.redirect("/movie_detail.html?movie_id=" + req.body._id)
                    }
                }
            )
        } else {
            const nb = new Blogpost(blogpost);
            nb.save((err, new_publication) => {
                if (err) {
                    console.log(err)
                    res.redirect('/get-edit-Blogpost?error_message=' + err.message + "&input=" + JSON.stringify(blogpost))
                } else {
                    console.log(new_publication._id);
                    res.redirect('/view-blog')
                }
            })
        }
        // otherwise redirect; not allowed to save blogposts
    } else if (req.isAuthenticated() && req.user.role === 'user') {
        res.redirect('/');
    } else {
        res.redirect('/'); // for non-logged in users
    }
});


//get the admin publication list
app.get('/admin-blog-list', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        res.sendFile(__dirname + '/private/BlogListAdmin.html')
    } else {
        res.redirect('/');
    }
})

//get the edit publication form for admins
app.get('/admin-edit-blog', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        res.sendFile(__dirname + '/private/editBlogpost.html')
    } else {
        res.redirect('/');
    }
})

app.post('/delete-blog-by-id', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        Blogpost.deleteOne(
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
    } else {
        res.redirect('/');
    }
});

//get the edit publication form for admins
app.get('/admin-edit-blog', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        res.sendFile(__dirname + '/private/editBlogpost.html')
    } else {
        res.redirect('/');
    }
})

app.get('/get-blog-by-id',
    function (req, res) {
        console.log(req.query.blog_id);
        Blogpost.find({"_id": req.query.blog_id}, function (err, data) {
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


    app.post('/save-blog-comment', (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/login');
        }
        const cmt = {user: req.user.fullname, 
            comment:req.body.comment_txt
        }
        Blogpost.findOneAndUpdate({"_id": req.query.blog_id},
            {$push: {comments: cmt} },
            {runValidators: true},
            (err, info) => {
                if (err) {
                    res.redirect('/')
                } else {
                    res.redirect('/view-blog')
                }
            }
        );

        
    })