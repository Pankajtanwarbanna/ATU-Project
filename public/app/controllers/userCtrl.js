/*
    Controller written by - Pankaj tanwar
*/
angular.module('userCtrl', ['fileModelDirective','uploadFileService','userServices'])

.controller('regCtrl', function ($scope, $http, $timeout, $location,user) {

    var app = this;

    this.regUser = function (regData) {

        app.successMsg = '';
        app.errorMsg = '';
        app.loading = true;

        user.create(app.regData).then(function (data) {

            //console.log(data);
            if(data.data.success) {
                app.loading = false;
                app.successMsg = data.data.message + ' Redirecting to home page...';
                $timeout(function () {
                    $location.path('/');
                }, 2000);
                
            } else {
                app.loading = false;
                app.errorMsg = data.data.message;
            }
        });
    };
})

.controller('usersCtrl', function (user) {
    var app = this;

    user.getUsers().then(function (data) {

        if(data.data.success) {
            console.log(app.users);
            app.users = data.data.users;
        } else {
            app.errorMsg = data.data.message;
        }
    });
})

.controller('profileCtrl', function (user) {

    var app  = this;
    //console.log('testing ctrl');
    user.getProfile().then(function (data) {
        //console.log(data);
        if(data.data.success) {
            app.userProfile = data.data.user;
        } else {
            app.errorMsg = data.data.message;
        }
    });

    app.doUpdate = function (profileData) {
        console.log(app.profileData);
        user.doUpdate(app.profileData).then(function (data) {
            //console.log(data);
            if(data.data.success) {
                demo.showSuccessNotification('top','center');
            } else {
                demo.showErrorNotification('top','center');
            }
        });
    }
})

.controller('subjectCtrl', function (user) {

    var app = this;

    // Add subject to database - Professor
    app.addSubject = function (subjectData) {
        //console.log(app.subjectData);
        user.addSubject(app.subjectData).then(function (data) {
            //console.log(data);
            if(data.data.success) {
                demo.showSuccessMessage('top','center',data.data.message);
                app.subjectData = false;
            } else {
                demo.showErrorMessage('top','center',data.data.message);
            }
        });
    };

    // Get all subjects - professor
    user.getSubjects().then(function (data) {
        //console.log(data);
        if(data.data.success) {
            app.subjects = data.data.subjects;
        } else {
            demo.showErrorMessage('top','center',data.data.message);
        }
    });

    // get all subjects - student
    user.getJoinedSubjects().then(function (data) {
        //console.log(data);
        if(data.data.success) {
            //console.log(data.data.subjects);
            app.subjects = data.data.subjects;
        }
    });

    // join subject - Student
    app.joinSubject = function (subjectData) {

        user.joinSubject(app.subjectData).then(function (data) {
            console.log(data);
            if(data.data.success) {
                demo.showSuccessMessage('top','center',data.data.message);
                app.subjectData = false;
            } else {
                demo.showErrorMessage('top','center',data.data.message);
            }
        });
    }
})

.controller('studentCtrl', function (user) {

    //console.log('testing');

    var app = this;

    user.getProfSubjects().then(function (data) {
        console.log(data);
        if(data.data.success) {
            app.subjects = data.data.subjects;
            console.log(app.subjects);
        } else {
            demo.showErrorMessage('top','center',data.data.message);
        }
    });
})

.controller('studentSubjectCtrl', function (user,$routeParams) {

    var app = this;

    user.getProfSubjects().then(function (data) {
        //console.log(data);
        if(data.data.success) {
            app.subjects = data.data.subjects;
            //console.log(app.subjects);
        } else {
            demo.showErrorMessage('top','center',data.data.message);
        }
    });

    function getUpdatedStudents() {

        //console.log($routeParams.code);
        user.getStudents($routeParams.code).then(function (data) {
            //console.log(data);
            if(data.data.success) {
                app.students = data.data.students;
                app.subjectname = data.data.name;
                app.total = data.data.students.length;
                //console.log(app.students);
            } else {
                demo.showErrorMessage('top','center',data.data.message);
            }
        });

    }

    getUpdatedStudents();

    app.addPoints = function (points,email) {
        //console.log(points);
        //console.log(email);

        var pointsObj = {};

        pointsObj.points = points;
        pointsObj.email = email;
        pointsObj.code = $routeParams.code;

        console.log(pointsObj);

        user.addPoints(pointsObj).then(function (data) {
            //console.log(data);
            if(data.data.success) {
                getUpdatedStudents();
                demo.showSuccessMessage('top','center',data.data.message);
            } else {
                demo.showErrorMessage('top','center',data.data.message);
            }
        });
    };

    app.deductPoints = function (points,email) {
        //console.log(points);
        //console.log(email);

        var pointsObj = {};

        pointsObj.points = points;
        pointsObj.email = email;
        pointsObj.code = $routeParams.code;

        console.log(pointsObj);

        user.deductPoints(pointsObj).then(function (data) {
            //console.log(data);
            if(data.data.success) {
                getUpdatedStudents();
                demo.showSuccessMessage('top','center',data.data.message);
            } else {
                demo.showErrorMessage('top','center',data.data.message);
            }
        });
    }

})

.controller('transactionsCtrl', function (user) {

    //console.log('tseting');
    var app = this;

    user.getTransactions().then(function (data) {
        //console.log(data);
        if(data.data.success) {
            app.transactions = data.data.transactions;
            //console.log(app.transactions);
        } else {
            demo.showErrorMessage('top','center',data.data.message);
        }
    });
})

// posting an item with picture controller
.controller('eshopsellCtrl', function (uploadFile, $scope,user) {

    $scope.file = {};

    $scope.Submit = function (itemData) {
        console.log(itemData);
        $scope.uploading = true;
        uploadFile.upload($scope.file).then(function (data) {
            console.log(data);
            if(data.data.success) {

                // if image posted successfully - post item data
                user.postItem(itemData).then(function (data) {
                    if(data.data.success) {
                        $scope.uploading = false;
                        $scope.itemData = '';
                        demo.showSuccessMessage('top','center',data.data.message);
                        $scope.file = {};
                    } else {
                        $scope.uploading = false;
                        demo.showErrorMessage('top','center',data.data.message);
                    }
                });
            } else {
                $scope.uploading = false;
                demo.showErrorMessage('top','center',data.data.message);
                $scope.file = {};
            }
        })
    }

})

// buying an item controller
.controller('eshopbuyCtrl', function () {
    console.log('This ctrl is for testing ');
});