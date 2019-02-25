/*
    Controller written by - Pankaj tanwar
*/
angular.module('userCtrl',['userServices'])

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
        console.log(data);
        if(data.data.success) {
            console.log(data.data.subjects);
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

    console.log($routeParams.code);
    user.getStudents($routeParams.code).then(function (data) {
        //console.log(data);
        if(data.data.success) {
            app.students = data.data.students;
            app.total = data.data.students.length;
            //console.log(app.students);
        } else {
            demo.showErrorMessage('top','center',data.data.message);
        }
    });

});