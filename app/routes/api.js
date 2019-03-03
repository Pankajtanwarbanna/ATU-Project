/*
    API written by - Pankaj Tanwar
*/
var User = require('../models/user');
var Subject = require('../models/subject');
var Item = require('../models/item');
var jwt = require('jsonwebtoken');
var secret = 'atu-project';
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
// Uploading file stuff
var multer = require('multer');
var path = require('path');

module.exports = function (router){

    // Nodemailer-sandgrid stuff
    var options = {
        auth: {
            api_key: "YOUR_KEY"
        }
    };

    var client = nodemailer.createTransport(sgTransport(options));

    // User register API
    router.post('/register',function (req, res) {
        var user = new User();

        user.name = req.body.name;
        user.username = req.body.username;
        user.email = req.body.email;
        user.password = req.body.password;
        user.temporarytoken = jwt.sign({ email : user.email , username : user.username }, secret , { expiresIn : '24h' });

        //console.log(req.body);
        if(!user.name || !user.email || !user.password || !user.username) {
            res.json({
                success : false,
                message : 'Ensure you filled all entries!'
            });
        } else {
            user.save(function(err) {
                if(err) {
                    if(err.errors != null) {
                        // validation errors
                        if(err.errors.name) {
                            res.json({
                                success: false,
                                message: err.errors.name.message
                            });
                        } else if (err.errors.email) {
                            res.json({
                                success : false,
                                message : err.errors.email.message
                            });
                        } else if(err.errors.password) {
                            res.json({
                                success : false,
                                message : err.errors.password.message
                            });
                        } else {
                            res.json({
                                success : false,
                                message : err
                            });
                        }
                    } else {
                        // duplication errors
                        if(err.code === 11000) {
                            //console.log(err.errmsg);
                            if(err.errmsg[57] === 'e') {
                                res.json({
                                    success: false,
                                    message: 'Email is already registered.'
                                });
                            } else if(err.errmsg[57] === 'u') {
                                res.json({
                                    success : false,
                                    message : 'Username is already registered.'
                                });
                            } else {
                                res.json({
                                    success : false,
                                    message : err
                                });
                            }
                        } else {
                            res.json({
                                success: false,
                                message: err
                            })
                        }
                    }
                } else {

                    var email = {
                        from: 'ATU Project Registration, support@atuproject.com',
                        to: user.email,
                        subject: 'Activation Link - ATU Project Registration',
                        text: 'Hello '+ user.name + 'Thank you for registering with us.Please find the below activation link Activation link Thank you Pankaj Tanwar',
                        html: 'Hello <strong>'+ user.name + '</strong>,<br><br>Thank you for registering with us.Please find the below activation link<br><br><a href="https://atu-project.herokuapp.com/activate/'+ user.temporarytoken+'">Activation link</a><br><br>Thank you<br>Pankaj Tanwar'
                    };

                    client.sendMail(email, function(err, info){
                        if (err ){
                            console.log(err);
                            res.json({
                                success : false,
                                message : 'Email sending failed.'
                            })
                        }
                        else {
                            console.log('Message sent: ' + info.response);
                            res.json({
                                success : true,
                                message : 'Account registered! Please check your E-mail inbox for the activation link.'
                            });
                        }
                    });
                }
            });
        }
    });

    // User login API
    router.post('/authenticate', function (req,res) {

        if(!req.body.username || !req.body.password) {
            res.json({
                success : false,
                message : 'Ensure you fill all the entries.'
            });
        } else {

            User.findOne({ username : req.body.username }).select('email username password active').exec(function (err, user) {

                if(err) throw err;

                if(!user) {
                    res.json({
                        success : false,
                        message : 'User not found. Please Signup!'
                    });
                } else if(user) {

                    if(!user.active) {
                        res.json({
                            success : false,
                            message : 'Account is not activated yet.Please check your email for activation link.',
                            expired : true
                        });
                    } else {

                        var validPassword = user.comparePassword(req.body.password);

                        if (validPassword) {
                            var token = jwt.sign({
                                email: user.email,
                                username: user.username
                            }, secret, {expiresIn: '24h'});
                            res.json({
                                success: true,
                                message: 'User authenticated.',
                                token: token
                            });
                        } else {
                            res.json({
                                success: false,
                                message: 'Incorrect password. Please try again.'
                            });
                        }
                    }
                }
            });
        }

    });

    router.put('/activate/:token', function (req,res) {

        if(!req.params.token) {
            res.json({
                success : false,
                message : 'No token provided.'
            });
        } else {

            User.findOne({temporarytoken: req.params.token}, function (err, user) {
                if (err) throw err;

                var token = req.params.token;

                jwt.verify(token, secret, function (err, decoded) {
                    if (err) {
                        res.json({
                            success: false,
                            message: 'Activation link has been expired.'
                        })
                    }
                    else if (!user) {
                        res.json({
                            success: false,
                            message: 'Activation link has been expired.'
                        });
                    } else {

                        user.temporarytoken = false;
                        user.active = true;

                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {

                                var email = {
                                    from: 'ATU Project Registration, support@atuproject.com',
                                    to: user.email,
                                    subject: 'Activation activated',
                                    text: 'Hello ' + user.name + 'Your account has been activated.Thank you Pankaj Tanwar',
                                    html: 'Hello <strong>' + user.name + '</strong>,<br><br> Your account has been activated.<br><br>Thank you<br>Pankaj Tanwar'
                                };

                                client.sendMail(email, function (err, info) {
                                    if (err) {
                                        console.log(err);
                                        res.json({
                                            success : false,
                                            message : 'Messaging sending failed.'
                                        })
                                    }
                                    else {
                                        console.log('Message sent: ' + info.response);
                                        res.json({
                                            success: true,
                                            message: 'Account activated.'
                                        })
                                    }
                                });

                            }
                        });
                    }
                });
            })
        }
    });

    // Resend activation link
    router.post('/resend', function (req,res) {

        if(!req.body.username || !req.body.password) {
            res.json({
                success : false,
                message : 'Ensure you fill all the entries.'
            });
        } else {

            User.findOne({ username : req.body.username }).select('name username email password active temporarytoken').exec(function (err,user) {

                if(!user) {
                    res.json({
                        success : false,
                        message : 'User is not registered with us.Please signup!'
                    });
                } else {
                    if(user.active) {
                        res.json({
                            success : false,
                            message : 'Account is already activated.'
                        });
                    } else {

                        var validPassword = user.comparePassword(req.body.password);

                        if(!validPassword) {
                            res.json({
                                success : false,
                                message : 'Incorrect password.'
                            });
                        } else {
                            res.json({
                                success : true,
                                user : user
                            });

                        }
                    }
                }
            })
        }
    });

    // router to update temporary token in the database
    router.put('/sendlink', function (req,res) {

        User.findOne({username : req.body.username}).select('email username name temporarytoken').exec(function (err,user) {
            if (err) throw err;

            user.temporarytoken = jwt.sign({
                email: user.email,
                username: user.username
            }, secret, {expiresIn: '24h'});

            user.save(function (err) {
                if(err) {
                    console.log(err);
                } else {

                    var email = {
                        from: 'ATU Project Registration, support@atuproject.com',
                        to: user.email,
                        subject: 'Activation Link request - ATU Project Registration',
                        text: 'Hello '+ user.name + 'You requested for the new activation link.Please find the below activation link Activation link Thank you Pankaj Tanwar CEO, Polymath',
                        html: 'Hello <strong>'+ user.name + '</strong>,<br><br>You requested for the new activation link.Please find the below activation link<br><br><a href="https://atu-project.herokuapp.com/activate/'+ user.temporarytoken+'">Activation link</a><br><br>Thank you<br>Pankaj Tanwar'
                    };

                    client.sendMail(email, function(err, info){
                        if (err ){
                            console.log(err);
                            res.json({
                                success : false,
                                message : 'Message sending failed.'
                            })
                        }
                        else {
                            console.log('Message sent: ' + info.response);
                            res.json({
                                success : true,
                                message : 'Link has been successfully sent to registered email.'
                            });
                        }
                    });
                }
            })
        });


    });

    // Forgot username route
    router.post('/forgotUsername', function (req,res) {

        if(!req.body.email) {
            res.json({
                success : false,
                message : 'Please ensure you fill all the entries.'
            });
        } else {
            User.findOne({email : req.body.email}).select('username email name').exec(function (err,user) {
                if(err) throw err;

                if(!user) {
                    res.json({
                        success : false,
                        message : 'Email is not registered with us.'
                    });
                } else if(user) {

                    var email = {
                        from: 'ATU Project, support@atuproject.com',
                        to: user.email,
                        subject: 'Forgot Username Request',
                        text: 'Hello '+ user.name + 'You requested for your username.You username is ' + user.username + 'Thank you Pankaj Tanwar CEO',
                        html: 'Hello <strong>'+ user.name + '</strong>,<br><br>You requested for your username.You username is <strong>'+ user.username + '</strong><br><br>Thank you<br>Pankaj Tanwar<br>'
                    };

                    client.sendMail(email, function(err, info){
                        if (err ){
                            console.log(err);
                            res.json({
                                success : false,
                                message : 'Message sending failed.'
                            })
                        }
                        else {
                            console.log('Message sent: ' + info.response);
                            res.json({
                                success : true,
                                message : 'Username has been successfully sent to your email.'
                            });
                        }
                    });
                } else {
                    res.send(user);
                }

            });
        }

    });

    // Send link to email id for reset password
    router.put('/forgotPasswordLink', function (req,res) {

        if(!req.body.username) {
            res.json({
                success : false,
                message : 'Please ensure you filled the entries.'
            });
        } else {

            User.findOne({ username : req.body.username }).select('username email temporarytoken name').exec(function (err,user) {
                if(err) throw err;

                if(!user) {
                    res.json({
                        success : false,
                        message : 'Username not found.'
                    });
                } else {

                    console.log(user.temporarytoken);

                    user.temporarytoken = jwt.sign({
                        email: user.email,
                        username: user.username
                    }, secret, {expiresIn: '24h'});

                    console.log(user.temporarytoken);

                    user.save(function (err) {
                        if(err) {
                            res.json({
                                success : false,
                                message : 'Error accured! Please try again. '
                            })
                        } else {

                            var email = {
                                from: 'ATU Project Registration, support@atuproject.com',
                                to: user.email,
                                subject: 'Forgot Password Request',
                                text: 'Hello '+ user.name + 'You request for the forgot password.Please find the below link Reset password Thank you Pankaj Tanwar CEO, Polymath',
                                html: 'Hello <strong>'+ user.name + '</strong>,<br><br>You requested for the forgot password. Please find the below link<br><br><a href="https://atu-project.herokuapp.com/forgotPassword/'+ user.temporarytoken+'">Reset password</a><br><br>Thank you<br>Pankaj Tanwar'
                            };

                            client.sendMail(email, function(err, info){
                                if (err ){
                                    console.log(err);
                                    res.json({
                                        success : false,
                                        message : 'Message sending failed.'
                                    })
                                }
                                else {
                                    console.log('Message sent: ' + info.response);
                                    res.json({
                                        success : true,
                                        message : 'Link to reset your password has been sent to your registered email.'
                                    });
                                }
                            });

                        }
                    });

                }

            })

        }
    });

    // router to change password
    router.post('/forgotPassword/:token', function (req,res) {

        if(!req.params.token) {
            res.json({
                success : false,
                message : 'No token provied.'
            });
        } else {

            User.findOne({ temporarytoken : req.params.token }).select('username temporarytoken').exec(function (err,user) {

                if(err) throw err;

                if(!user) {
                    res.json({
                        success : false,
                        message : 'Link has been expired.'
                    });
                } else {
                    res.json({
                        success : true,
                        user : user
                    });
                }
            });
        }
    });

    // route to reset password
    router.put('/resetPassword/:token', function (req,res) {

        console.log('api is working fine');

        if(!req.body.password) {
            res.json({
                success : false,
                message : 'New password is missing.'
            })
        } else {

            User.findOne({ temporarytoken : req.params.token }).select('name password').exec(function (err,user) {

                if(err) throw err;

                if(!user) {
                    res.json({
                        success : false,
                        message : 'Link has been expired.'
                    })
                } else {

                    user.password = req.body.password;
                    user.temporarytoken = false;

                    user.save(function (err) {
                        if(err) {
                            res.json({
                                success : false,
                                message : 'Password must have one lowercase, one uppercase, one special character, one number and minimum 8 and maximum 25 character.'
                            });
                        } else {

                            var email = {
                                from: 'ATU Project , support@atuproject.com',
                                to: user.email,
                                subject: 'Password reset',
                                text: 'Hello '+ user.name + 'You request for the reset password.Your password has been reset. Thank you Pankaj Tanwar',
                                html: 'Hello <strong>'+ user.name + '</strong>,<br><br>You requested for the reset password. Your password has been reset.<br><br>Thank you<br>Pankaj Tanwar'
                            };

                            client.sendMail(email, function(err, info){
                                if (err ){
                                    console.log(err);
                                    res.json({
                                        success : false,
                                        message : 'Message sending failed.'
                                    })
                                }
                                else {
                                    console.log('Message sent: ' + info.response);
                                    res.json({
                                        success : true,
                                        message : 'Password has been changed successfully.'
                                    })
                                }
                            });
                        }
                    })
                }
            })
        }
    });

    // Middleware to verify token
    router.use(function (req,res,next) {

        var token = req.body.token || req.body.query || req.headers['x-access-token'];

        if(token) {
            // verify token
            jwt.verify(token, secret, function (err,decoded) {
                if (err) {
                    res.json({
                        success : false,
                        message : 'Token invalid.'
                    })
                }
                else {
                    req.decoded = decoded;
                    next();
                }
            });

        }
    });

    // API User profile
    router.post('/me', function (req,res) {

        //console.log(req.decoded.email);
        // getting profile of user from database using email, saved in the token in localStorage
        User.findOne({ email : req.decoded.email }).select('email username name').exec(function (err, user) {
            if(err) throw err;

            if(!user) {
                res.status(500).send('User not found.');
            } else {
                res.send(user);
            }
        });
    });

    // get permission of user
    router.get('/permission', function (req,res) {

        User.findOne({ username : req.decoded.username }).select('permission').exec(function (err,user) {

            if(err) throw err;

            if(!user) {
                res.json({
                    success : false,
                    message : 'User not found.'
                })
            } else {
                res.json({
                    success : true,
                    permission : user.permission
                })
            }
        })
    });

    // get all users
    router.get('/management', function (req, res) {

        User.find({}, function (err, users) {

            if(err) throw err;
            User.findOne({ username : req.decoded.username }, function (err,mainUser) {

                if(err) throw err;
                if(!mainUser) {
                    res.json({
                        success : false,
                        message : 'User not found.'
                    });
                } else {
                    if(!users) {
                        res.json({
                            success : false,
                            message : 'Users not found.'
                        });
                    } else {
                        res.json({
                            success : true,
                            users : users,
                            permission : mainUser.permission
                        })
                    }
                }
            })
        })
    });

    // delete a user form database
    router.delete('/management/:username', function (req,res) {

        var deletedUser = req.params.username;

        User.findOne({ username : req.decoded.username }, function (err,mainUser) {

            if(err) throw err;

            if(!mainUser) {
                res.json({
                    success : false,
                    message : 'User not found.'
                });
            } else {
                if(mainUser.permission !== 'admin') {
                    res.json({
                        success : false,
                        message : 'Insufficient permission'
                    });
                } else {
                    User.findOneAndRemove({ username : deletedUser }, function (err,user) {
                        if(err) throw err;

                        res.json({
                            success : true,
                        });
                    });
                }
            }
        })
    });

    // route to edit user
    router.get('/edit/:id', function (req,res) {
        var editedUser = req.params.id;

        User.findOne({ username : req.decoded.username }, function (err,mainUser) {
            if(err) throw err;

            if(!mainUser) {
                res.json({
                    success : false,
                    message : 'User not found...'
                });
            } else {
                if(mainUser.permission === 'admin') {

                    User.findOne({ _id : editedUser }, function (err, user) {

                        if(err) throw err;

                        if(!user) {
                            res.json({
                                success : false,
                                message : 'User not found.'
                            });
                        } else {
                            res.json({
                                success : true,
                                user : user
                            })
                        }

                    })

                } else {
                    res.json({
                        success : false,
                        message : 'Insufficient permission.'
                    })
                }
            }
        })
    });

    // update user details
    router.put('/edit', function (req,res) {

        var editedUser = req.body._id;

        if(req.body.name) {
            var newName = req.body.name;
        }
        if(req.body.username) {
            var newUsername = req.body.username;
        }
        if(req.body.email) {
            var newEmail = req.body.email;
        }
        if(req.body.permission) {
            var newPermission = req.body.permission;
        }

        User.findOne({ username : req.decoded.username }, function (err,mainUser) {
            if(err) throw err;

            if(!mainUser) {
                res.json({
                    success : false,
                    message : 'User not found'
                });
            } else {
                if(mainUser.permission === 'admin') {

                    // update name
                    if(newName) {
                        User.findOne({ _id : editedUser }, function (err,user) {
                            if(err) throw err;

                            if(!user) {
                                res.json({
                                    success : false,
                                    message : 'User not found.'
                                });
                            } else {
                                user.name = newName;
                                user.save(function (err) {
                                    if(err) {
                                        if(err.errors.name) {
                                            res.json({
                                                success : false,
                                                message : err.errors.name.message
                                            })
                                        } else {
                                            res.json({
                                                success : false,
                                                message : 'Error! Please try again.'
                                            })
                                        }
                                    }

                                    else {

                                        res.json({
                                            success : true,
                                            message : 'Name has been updated.'
                                        });
                                    }

                                })
                            }

                        })
                    }

                    // update username
                    if(newUsername) {
                        User.findOne({ _id : editedUser }, function (err,user) {
                            if(err) throw err;

                            if(!user) {
                                res.json({
                                    success : false,
                                    message : 'User not found.'
                                });
                            } else {
                                user.username = newUsername;
                                user.save(function (err) {
                                    if(err) {
                                        if(err.errors) {
                                            res.json({
                                                success : false,
                                                message : err.errors.username.message
                                            })
                                        } else {
                                            res.json({
                                                success : false,
                                                message : 'Username is not unique.'
                                            })
                                        }
                                    }

                                    res.json({
                                        success : true,
                                        message : 'Username has been updated.'
                                    })
                                })
                            }

                        })
                    }

                    // update email
                    if(newEmail) {
                        User.findOne({ _id : editedUser }, function (err,user) {
                            if(err) throw err;

                            if(!user) {
                                res.json({
                                    success : false,
                                    message : 'User not found.'
                                });
                            } else {
                                user.email = newEmail;
                                user.save(function (err) {
                                    if(err) {
                                        if(err.errors) {
                                            console.log(err.errors);
                                            res.json({
                                                success : false,
                                                message : err.errors.email.message
                                            })
                                        } else {
                                            res.json({
                                                success : false,
                                                message : 'User is already registered with us.'
                                            })
                                        }
                                    } else {
                                        res.json({
                                            success : true,
                                            message : 'Email has been updated.'
                                        });
                                    }

                                })
                            }

                        })
                    }

                    // update permission
                    if(newPermission) {
                        User.findOne({ _id : editedUser }, function (err,user) {
                            if(err) throw err;

                            if(!user) {
                                res.json({
                                    success : false,
                                    message : 'User not found.'
                                });
                            } else {
                                console.log(user.permission);
                                console.log(mainUser.permission);

                                if(user.permission === 'user' && mainUser.permission === 'admin') {
                                    user.permission = 'admin';

                                    user.save(function (err) {
                                        if(err) {
                                            res.json({
                                                success : false,
                                                message : 'Can not upgrade to admin'
                                            });
                                        } else {
                                            res.json({
                                                success : true,
                                                message : 'Successfully upgraded to admin.'
                                            })
                                        }
                                    });

                                } else if(user.permission === 'user' && mainUser.permission === 'user') {
                                    res.json({
                                        success : false,
                                        message : 'Insufficient permission.'
                                    })
                                } else if(user.permission === 'admin' && mainUser.permission === 'admin') {
                                    res.json({
                                        success : false,
                                        message : 'Role is already admin.'
                                    })
                                } else if (user.permission === 'admin' && mainUser.permission === 'user') {
                                    res.json({
                                        success : false,
                                        message : 'Insufficient permission.'
                                    })
                                } else {
                                    res.json({
                                        success : true,
                                        message : 'Please try again later.'
                                    })
                                }
                            }

                        });
                    }


                } else {
                    res.json({
                        success : false,
                        message : 'Insufficient permission.'
                    })
                }
            }
        });
    });

    // Get profile of logged in user
    router.get('/getProfile', function (req, res) {

        //console.log(req.decoded.username);

        User.findOne({ username : req.decoded.username }, function (err, user) {
            if(err) {
                res.json({
                    success : false,
                    message : 'Error in getting profile from database!'
                });
            }

            if(!user) {
                res.json({
                    success : false,
                    message : 'User not found.'
                });
            } else {
                res.json({
                    success : true,
                    user : user
                })
            }
        });
    });

    // update user profile
    router.put('/doUpdate', function (req, res) {

        if(!req.decoded.username) {
            res.json({
                success : false,
                message : 'User is not logged in. Please login.'
            });
        } else {
            User.findOne({ username : req.decoded.username }, function (err, user) {
                if(err) {
                    res.json({
                        success : false,
                        message : 'Database error!'
                    });
                }

                if(!user) {
                    res.json({
                        success : false,
                        message : 'User not found.'
                    });
                } else {
                    //console.log(req.body);
                    //console.log(user);

                    if(req.body.college) {
                        user.college = req.body.college;
                    }

                    if(req.body.course) {
                        user.course = req.body.course;
                    }

                    if(req.body.rollnumber) {
                        user.rollnumber = req.body.rollnumber;
                    }

                    if(req.body.city) {
                        user.city = req.body.city;
                    }

                    if(req.body.country) {
                        user.country = req.body.country;
                    }

                    if(req.body.postel) {
                        user.postel = req.body.postel;
                    }

                    if(req.body.about) {
                        user.about = req.body.about;
                    }

                    user.save(function (err) {
                        if(err) {
                            console.log(err);
                            res.json({
                                success : false,
                                message : 'Error while updating your profile.'
                            });
                        } else {
                            res.json({
                                success : true,
                                message : 'Profile Update Successfully.'
                            })

                        }
                    });
                }
            })
        }

    });

    // Add a subject
    router.post('/addSubject', function (req, res) {
        //console.log(req.body);
        if(!req.decoded.username) {
            res.json({
                success : false,
                message : 'User is not logged in.'
            });
        } else {
            User.findOne({ username : req.decoded.username },function (err, user) {
                if(err) {
                    res.json({
                        success : false,
                        message : 'Database error.'
                    });
                }

                if(!user) {
                    res.json({
                        success : false,
                        message : 'User not found.'
                    });
                } else {
                    if(user.permission === 'professor') {

                        var subject = new Subject();

                        subject.name = req.body.name;
                        subject.professorname = user.name;
                        subject.professorusername = req.decoded.username;


                        Subject.countDocuments(function (err, count) {
                            if(err) {
                                //console.log(err);
                                res.json({
                                    success : false,
                                    message : 'Database Error. Please try again later.'
                                })
                            } else {
                                //console.log(count);

                                subject.code = "ATU" + (101 + count);

                                subject.save(function (err) {
                                    if(err) {
                                        console.log(err);
                                        res.json({
                                            success : false,
                                            message : 'Database error. Please try again later.'
                                        });
                                    } else {
                                        res.json({
                                            success : true,
                                            message : 'Subject successfully added. Visit Subjects Section for Subject Code.',
                                            code : subject.code
                                        });
                                    }
                                })
                            }
                        });
                    } else {
                        res.json({
                            success : false,
                            message : 'You are not authorized.'
                        });
                    }
                }
            })
        }
    });

    // get all subjects from database
    router.get('/getSubjects', function (req, res) {
        if(!req.decoded.username) {
            res.json({
                success : false,
                message : 'User is not logged in.'
            });
        } else {
            User.findOne({ username : req.decoded.username },function (err, user) {
                if(err) {
                    res.json({
                        success : false,
                        message : 'Database error.'
                    });
                }

                if(!user) {
                    res.json({
                        success : false,
                        message : 'User not found.'
                    });
                } else {
                    if(user.permission === 'professor') {

                        Subject.find({ professorusername : req.decoded.username }, function (err, subjects) {
                            if(err) {
                                res.json({
                                    success : false,
                                    message : 'Database Error.'
                                });
                            }

                            if(!subjects) {
                                res.json({
                                    success : false,
                                    message : 'Subjects not found. Please try again later.'
                                })
                            } else {
                                res.json({
                                    success : true,
                                    message : 'Successfully subjects got from database.',
                                    subjects : subjects
                                });
                            }
                        })

                    }
                }
            })
        }
    });

    // Join a subject - Student
    router.post('/joinSubject', function (req, res) {
       // console.log(req.body);

        if(!req.decoded.username) {
            res.json({
                success : false,
                message : 'User is not logged in.'
            });
        } else {
            User.findOne({ username : req.decoded.username },function (err, user) {
                if(err) {
                    res.json({
                        success : false,
                        message : 'Database error.'
                    });
                }

                if(!user) {
                    res.json({
                        success : false,
                        message : 'User not found.'
                    });
                } else {
                    if(user.permission === 'student') {

                        var flag = 0;

                        // Check user already joined this class
                        //console.log(user.subjects);
                        for(var i=0;i<user.subjects.length;i++) {
                            //console.log(user.subjects[i].subject.code);
                            if(user.subjects[i].subject.code === req.body.code.toUpperCase()) {
                                flag = 1;
                                res.json({
                                    success : false,
                                    message : 'Already joined class. Please enter another class code.'
                                });
                            }
                        }

                        if(flag !== 1) {

                            //console.log(req.body.code.toUpperCase());
                            Subject.findOne({ code : req.body.code.toUpperCase() }, function (err, sub) {
                                if(err) {
                                    res.json({
                                        success : false,
                                        message : 'Database error.'
                                    });
                                }

                                if(!sub) {
                                    res.json({
                                        success : false,
                                        message : 'Invalid Subject Code. Please enter correct Subject Code.'
                                    });
                                } else {

                                    //console.log(user);

                                    var subject = {};

                                    subject.code = sub.code;
                                    subject.professorname = sub.professorname;
                                    subject.points = 0;
                                    subject.name = sub.name;

                                    //console.log(subjectObj);
                                    user.subjects.push({subject : subject });

                                    user.save(function (err) {
                                        if(err) {
                                            res.json({
                                                success : true,
                                                message : 'Database error.'
                                            });
                                        } else {

                                            var studentObj = {};

                                            studentObj.name = user.name;
                                            studentObj.email = user.email;
                                            studentObj.points = 0;
                                            studentObj.rollnumber = user.rollnumber;

                                            sub.students.push(studentObj);

                                            console.log(sub.students);

                                            sub.save(function (err) {
                                                if(err) {
                                                    res.json({
                                                        success : false,
                                                        message : 'Database error.'
                                                    })
                                                } else {
                                                    res.json({
                                                        success : true,
                                                        message : 'Successfully joined subject. Visit Subjects section.'
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });

                        }
                    }
                }
            })
        }
    });

    // get all subjects joined by student
    router.get('/getJoinedSubjects', function (req, res) {
        if(!req.decoded.username) {
            res.json({
                success : false,
                message : 'User is not logged in.'
            });
        } else {
            User.findOne({ username : req.decoded.username },function (err, user) {
                if(err) {
                    res.json({
                        success : false,
                        message : 'Database error.'
                    });
                }

                if(!user) {
                    res.json({
                        success : false,
                        message : 'User not found.'
                    });
                } else {
                    if(user.permission === 'student') {
                        res.json({
                            success : true,
                            subjects : user.subjects
                        })
                    }
                }
            })
        }
    });

    // get all prof subjects
    router.get('/getProfSubjects', function (req, res) {
        if(!req.decoded.username) {
            res.json({
                success : false,
                message : 'User is not logged in.'
            });
        } else {
            User.findOne({ username : req.decoded.username }, function (err, user) {
                if(err) {
                    res.json({
                        success : false,
                        message : 'Database error.'
                    });
                }

                if(!user) {
                    res.json({
                        success : false,
                        message : 'User not found.'
                    });
                } else {
                    if(user.permission === 'professor') {

                        Subject.find({ professorusername : req.decoded.username }, function (err, subjects) {
                            if(err) {
                                res.json({
                                    success : false,
                                    message : 'Database error.'
                                });
                            }

                            if(!subjects) {
                                res.json({
                                    success : true,
                                    message : 'Subjects not found.'
                                });
                            } else {
                                res.json({
                                    success : true,
                                    subjects : subjects
                                });
                            }
                        })

                    } else {
                        res.json({
                            success : false,
                            message : 'You are not authorized.'
                        })
                    }
                }
            })

        }
    });

    // get students of a subject
    router.get('/getStudents/:code', function (req, res) {
        //console.log(req.params.code);
        if(!req.decoded.username) {
            res.json({
                success : false,
                message : 'User is not logged in.'
            });
        } else {
            Subject.findOne({ code : req.params.code }, function (err, subject) {
                if(err) {
                    res.json({
                        success : false,
                        message : 'Database error.'
                    });
                }

                if(!subject) {
                    res.json({
                        success : false,
                        message : 'No subject found.'
                    });
                } else {
                    res.json({
                        success : true,
                        students : subject.students,
                        name : subject.name
                    });
                    //console.log(subject.students);
                }
            })
        }
    });

    // add points in a subject
    router.post('/addPoints', function (req, res) {
        console.log(req.body);
        if(!req.body.points) {
            res.json({
                success : false,
                message : 'Please enter a valid number.'
            });
        } else {
            if(!req.decoded.username) {
                res.json({
                    success : false,
                    message : 'User is not logged in.'
                });
            } else {
                Subject.findOne({ code : req.body.code }, function (err, subject) {
                    if(err) {
                        res.json({
                            success : false,
                            message : 'Database error.'
                        });
                    }

                    if(!subject) {
                        res.json({
                            success : false,
                            message : 'Subject not found. Database error.'
                        });
                    } else {
                        //console.log(subject.students);
                        for(var i=0;i<subject.students.length;i++) {
                            //console.log(subject.students[i].email);
                            if(subject.students[i].email === req.body.email) {
                                subject.students[i].points = subject.students[i].points + Number(req.body.points);

                                subject.save(function (err) {
                                    if(err) {
                                        res.json({
                                            success : false,
                                            message : 'Database error.'
                                        });
                                    } else {

                                        User.findOne({ email : req.body.email }, function (err, user) {
                                            if(err) {
                                                res.json({
                                                    success : false,
                                                    message : 'Database error.Please try again later.'
                                                });
                                            }

                                            if(!user) {
                                                res.json({
                                                    success : false,
                                                    message : 'User not found.'
                                                });
                                            } else {
                                                //console.log(user.subjects);
                                                for(var i=0;i<user.subjects.length;i++) {
                                                    if(user.subjects[i].subject.code === req.body.code) {
                                                        user.subjects[i].subject.points = user.subjects[i].subject.points + Number(req.body.points);

                                                        user.transaction.push({ info : req.body.points + ' Marks added in Subject ' + subject.name + 'by Prof. '+ subject.professorname });

                                                        user.save(function (err) {
                                                            if(err) {
                                                                res.json({
                                                                    success : false,
                                                                    message : 'Database error.'
                                                                });
                                                            } else {

                                                                User.findOne({ username : subject.professorusername }, function (err, prof) {
                                                                    if(err) {
                                                                        res.json({
                                                                            success : false,
                                                                            message : 'Database error.'
                                                                        });
                                                                    }
                                                                    if(!prof) {
                                                                        res.json({
                                                                            success : false,
                                                                            message : 'Professor not found.'
                                                                        });
                                                                    } else {
                                                                        prof.transaction.push({ info : req.body.points + ' Marks added in Subject ' + subject.name + ' to student '+ user.name + ' by you.'});

                                                                        prof.save(function (err) {
                                                                            if(err) {
                                                                                res.json({
                                                                                    success : false,
                                                                                    message : 'Database error.'
                                                                                });
                                                                            } else {
                                                                                res.json({
                                                                                    success : true,
                                                                                    message : 'Successfully updated points.'
                                                                                });
                                                                            }
                                                                        })
                                                                    }
                                                                });
                                                            }
                                                        });
                                                        break;
                                                    }
                                                }
                                            }
                                        });
                                    }
                                });
                                break;
                            }
                        }
                    }
                })
            }

        }
    });

    // deduct points in a subject
    router.post('/deductPoints', function (req, res) {
        //console.log(req.body);

        if(!req.body.points) {
            res.json({
                success : false,
                message : 'Please enter a valid number.'
            });
        } else {
            if(!req.decoded.username) {
                res.json({
                    success : false,
                    message : 'User is not logged in.'
                });
            } else {
                Subject.findOne({ code : req.body.code }, function (err, subject) {
                    if(err) {
                        res.json({
                            success : false,
                            message : 'Database error.'
                        });
                    }

                    if(!subject) {
                        res.json({
                            success : false,
                            message : 'Subject not found. Database error.'
                        });
                    } else {
                        //console.log(subject.students);
                        for(var i=0;i<subject.students.length;i++) {
                            //console.log(subject.students[i].email);
                            if(subject.students[i].email === req.body.email) {
                                subject.students[i].points = subject.students[i].points - Number(req.body.points);

                                if(subject.students[i].points < 0) {
                                    subject.students[i].points = 0;
                                }

                                subject.save(function (err) {
                                    if(err) {
                                        res.json({
                                            success : false,
                                            message : 'Database error.'
                                        });
                                    } else {

                                        User.findOne({ email : req.body.email }, function (err, user) {
                                            if(err) {
                                                res.json({
                                                    success : false,
                                                    message : 'Database error.Please try again later.'
                                                });
                                            }

                                            if(!user) {
                                                res.json({
                                                    success : false,
                                                    message : 'User not found.'
                                                });
                                            } else {
                                                //console.log(user.subjects);
                                                for(var i=0;i<user.subjects.length;i++) {
                                                    if(user.subjects[i].subject.code === req.body.code) {
                                                        user.subjects[i].subject.points = user.subjects[i].subject.points - Number(req.body.points);

                                                        if(user.subjects[i].subject.points < 0) {
                                                            user.subjects[i].subject.points = 0;
                                                        }

                                                        user.transaction.push({ info : req.body.points + ' Marks deducted in Subject ' + subject.name + ' by Prof. '+ subject.professorname })

                                                        user.save(function (err) {
                                                            if(err) {
                                                                res.json({
                                                                    success : false,
                                                                    message : 'Database error.'
                                                                });
                                                            } else {
                                                                User.findOne({ username : subject.professorusername }, function (err, prof) {
                                                                    if(err) {
                                                                        res.json({
                                                                            success : false,
                                                                            message : 'Database error.'
                                                                        });
                                                                    }
                                                                    if(!prof) {
                                                                        res.json({
                                                                            success : false,
                                                                            message : 'Professor not found.'
                                                                        });
                                                                    } else {
                                                                        prof.transaction.push({ info : req.body.points + ' Marks deducted in Subject ' + subject.name + ' to student '+ user.name + ' by you.'});

                                                                        prof.save(function (err) {
                                                                            if(err) {
                                                                                res.json({
                                                                                    success : false,
                                                                                    message : 'Database error.'
                                                                                });
                                                                            } else {
                                                                                res.json({
                                                                                    success : true,
                                                                                    message : 'Successfully updated points.'
                                                                                });
                                                                            }
                                                                        })
                                                                    }
                                                                });
                                                            }
                                                        });
                                                        break;
                                                    }
                                                }
                                            }
                                        });
                                    }
                                });
                                break;
                            }
                        }
                    }
                })
            }
        }
    });

    // get transactions of a user
    router.get('/getTransactions', function (req, res) {

        if(!req.decoded.username) {
            res.json({
                success : false,
                message : 'User is not logged in.'
            });
        } else {
            User.findOne({ username : req.decoded.username }, function (err, user) {
                if(err) {
                    res.json({
                        success : false,
                        message : 'Database error.'
                    });
                }

                if(!user) {
                    res.json({
                        success : false,
                        message : 'User not found.'
                    });
                } else {
                    res.json({
                        success : true,
                        transactions : user.transaction
                    });
                }
            })
        }
    });

    // get total points
    router.get('/getTotalPoints', function (req, res) {
        if(!req.decoded.username) {
            res.json({
                success : false,
                message : 'User is not logged in.'
            });
        } else {
            User.findOne({ username : req.decoded.username }, function (err, user) {
                if(err) {
                    res.json({
                        success : false,
                        message : 'Database error.'
                    });
                }

                if(!user) {
                    res.json({
                        success : false,
                        message : 'User not found.'
                    });
                } else {
                    //console.log(user.subjects);

                    var totalpoints = 0;

                    for(var i=0;i<user.subjects.length;i++) {
                        //console.log(user.subjects[i].subject.points);
                        totalpoints = totalpoints + user.subjects[i].subject.points;
                        //console.log(totalpoints);
                    }

                    res.json({
                        success : true,
                        totalpoints : totalpoints
                    });
                }
            })
        }
    });

    // Multer file upload stuff
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/uploads')
        },
        filename: function (req, file, cb) {

            if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
                var err = new Error();
                err.code = 'fileType';

                return cb(err);
            } else {

                Item.countDocuments(function (err, count) {

                    if(err) {
                        err.code = 'database';
                        return cb(err);
                    } else {
                        cb(null,  file.fieldname + '-'+ count + '.jpg');
                    }
                    // path.extname(file.originalname)

                });
            }
        }
    });

    var upload = multer({
        storage: storage,
        limits : { fileSize : 10000000 }
    }).single('myFile');


    // route to upload picture
    router.post('/upload', function (req,res) {

        upload(req, res, function (err) {
            if (err) {
                // A Multer error occurred when uploading.
                if(err.code === 'LIMIT_FILE_SIZE') {
                    res.json({
                        success : false,
                        message : 'File size limit exceed. Max file size is 10MB.'
                    });
                } else if(err.code === 'fileType') {
                    res.json({
                        success : false,
                        message : 'File format not accepted. Must be .png/.jpeg/.jpg'
                    });
                } else {
                    console.log(err);
                    res.json({
                        success : false,
                        message : 'File was unable to upload.'
                    });
                }
            } else  {
                // everything is fine
                if(!req.file) {
                    res.json({
                        success : false,
                        message : 'Please select a file.'
                    });
                } else {
                    res.json({
                        success : true,
                        message : 'File Uploaded successfully.'
                    });
                }

            }
        });
    });

    // check user has join a class for posting an item
    router.get('/checkClass', function (req, res) {
        if(!req.decoded.username) {
            res.json({
                success : false,
                message : 'user is not logged in.'
            });
        } else {
            User.findOne({ username : req.decoded.username }, function (err, user) {
                if(err) {
                    res.json({
                        success : false,
                        message : 'Database error'
                    });
                }

                if(!user) {
                    res.json({
                        success : false,
                        message : 'User not found.'
                    });
                } else {
                    if(user.subjects.length === 0) {
                        res.json({
                            success : false,
                            disable : true,
                            message : 'First join a subject to post item.'
                        });
                    } else {
                        res.json({
                            success : true,
                            disable : false
                        });
                    }
                }
            })
        }
    });

    // post an item for sell
    router.post('/postItem', function (req, res) {

        if(!req.decoded.username) {
            res.json({
                success : false,
                message : 'User is not logged in.'
            });
        } else if(!req.body) {
            res.json({
                success : false,
                message : 'Please fill all entries.'
            });
        } else {
            var item = new Item();

            item.name = req.body.name;
            item.category = req.body.category;
            item.description = req.body.description;
            item.points = req.body.points;
            item.seller = req.decoded.username;

            Item.countDocuments(function (err, count) {
                if(err) {
                    res.json({
                        success : false,
                        messag : 'Database error.'
                    });
                } else {
                    item.image = 'myFile-' + count;

                    item.save(function (err) {
                        if(err) {
                            console.log(err);
                            res.json({
                                success : false,
                                message : 'Database error.'
                            });
                        } else {
                            res.json({
                                success : true,
                                message : 'Item posted successfully.'
                            });
                        }
                    });
                }
            });
        }
    });

    // get items form database
    router.get('/getItems', function (req, res) {
        if(!req.decoded.username) {
            res.json({
                success : false,
                message : 'User is not logged in.'
            });
        } else {
            Item.find({  }, function (err, items) {
                if(err) {
                    res.json({
                        success : false,
                        message : 'Database error.'
                    });
                }

                if(!items) {
                    res.json({
                        success : false,
                        message : 'No Items found.'
                    });
                } else {
                    res.json({
                        success : true,
                        items : items
                    });
                }
            })
        }
    });

    // route to get personal item page details
    router.get('/getProduct/:id', function (req, res) {
        console.log(req.params.id);
        if(!req.decoded.username) {
            res.json({
                success : false,
                message : 'User is not logged in.'
            });
        } else {
            Item.findOne({ _id : req.params.id }, function (err, item) {
                if(err) {
                    res.json({
                        success : false,
                        message : 'Database error.'
                    });
                }

                if(!item) {
                    res.json({
                        success : false,
                        message : 'Item not found.'
                    });
                } else {
                    res.json({
                        success : true,
                        item : item
                    })
                }
            })
        }
    });

    // buy now a product
    router.post('/buyNow/:id', function (req, res) {
        console.log(req.params.id);

        if(!req.decoded.username) {
            res.json({
                success : false,
                message : 'User is not logged in.'
            });
        } else {
            console.log('User is logged in');
            Item.findOne({ _id : req.params.id }, function (err, item) {

                if(err) {
                    res.json({
                        success : false,
                        message : 'Database error.'
                    });
                }

                if(!item) {
                    res.json({
                        success : false,
                        message : 'Item not found.'
                    });
                } else {

                    if(item.seller === req.decoded.username) {
                        res.json({
                            success : false,
                            message : 'Oops! You can not buy your own product.'
                        });
                    } else {

                        // check points are enough
                        User.findOne({ username : req.decoded.username }, function (err,user) {
                            if(err) {
                                res.json({
                                    success : false,
                                    message : 'Database error.'
                                });
                            }

                            if(!user) {
                                res.json({
                                    success : false,
                                    message : 'User not found.'
                                });
                            } else {

                                var points = 0;

                                for(var i=0;i<user.subjects.length;i++) {
                                    points = points + user.subjects[i].subject.points;
                                }

                                if(points < item.points) {
                                    res.json({
                                        success : false,
                                        message : 'Oops! You do not have enough points.'
                                    });
                                } else {

                                    console.log('Enough points');

                                    var p = item.points;

                                    // Enough Points
                                    for(var i=0;i<user.subjects.length;i++) {
                                        if(p > 0) {
                                            if(p >= user.subjects[i].subject.points) {
                                                p = p - user.subjects[i].subject.points;
                                                user.subjects[i].subject.points = 0;
                                            } else {
                                                user.subjects[i].subject.points = user.subjects[i].subject.points - p;
                                                p = 0;
                                            }
                                        } else {
                                            break;
                                        }
                                    }

                                    user.save(function (err) {
                                        if(err) {
                                            res.json({
                                                success : false,
                                                message : 'Database error.'
                                            });
                                        } else {
                                            // now add in another seller's account
                                            console.log('Now adding in seller account');

                                            User.findOne({ username : item.seller }, function (err, seller) {
                                                if(err) {
                                                    res.json({
                                                        success : false,
                                                        message : 'Database error.'
                                                    });
                                                }

                                                if(!seller) {
                                                    res.json({
                                                        success : false,
                                                        message : 'Seller not found.'
                                                    });
                                                } else {
                                                    console.log('Adding points in seller accoount');
                                                    if(seller.subjects.length === 0) {
                                                        res.json({
                                                            success : false,
                                                            message : 'Ask seller to join at least one subject to sell it.'
                                                        });
                                                    } else {

                                                        seller.subjects[0].subject.points = seller.subjects[0].subject.points + item.points;

                                                        seller.save(function (err) {
                                                            if(err) {
                                                                res.json({
                                                                    success : false,
                                                                    message : 'Database error.'
                                                                });
                                                            } else {

                                                                console.log('saving item with updates');
                                                                item.buyer = req.decoded.username;
                                                                item.status = true;

                                                                item.save(function (err) {
                                                                    if(err) {
                                                                        res.json({
                                                                            success : false,
                                                                            message : 'Database error.'
                                                                        });
                                                                    } else {

                                                                        res.json({
                                                                            success : true,
                                                                            message : 'Yay! You successfully bought this item.'
                                                                        });
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    return router;
};

