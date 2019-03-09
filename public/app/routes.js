var app = angular.module('userRoutes', ['ngRoute'])

    .config(function ($routeProvider, $locationProvider) {
        $routeProvider

            .when('/about', {
                templateUrl : '/app/views/pages/about.html',
            })

            .when('/help', {
                templateUrl : '/app/views/pages/help.html',
            })

            .when('/profile', {
                templateUrl : '/app/views/pages/user-profile.html',
                authenticated : true,
                controller : 'profileCtrl',
                controllerAs : 'profile'
            })

            .when('/login', {
                templateUrl : '/app/views/pages/user-login.html',
                authenticated : false
            })

            .when('/register', {
                templateUrl : '/app/views/pages/user-registration.html',
                controller : 'regCtrl',
                controllerAs : 'register',
                authenticated : false
            })

            .when('/forgot', {
                templateUrl : '/app/views/pages/user-forgot.html',
                authenticated : false,
                controller : 'forgotCtrl',
                controllerAs : 'forgot'
            })

            .when('/forgotPassword/:token', {
                templateUrl : 'app/views/pages/user-reset-password.html',
                authenticated : false,
                controller : 'resetCtrl',
                controllerAs : 'reset'
            })

            .when('/resend', {
                templateUrl : '/app/views/pages/user-resend.html',
                authenticated : false,
                controller : 'resendCtrl',
                controllerAs : 'resend'
            })

            .when('/activate/:token', {
                templateUrl : '/app/views/pages/user-activate.html',
                authenticated : false,
                controller : 'emailCtrl',
                controllerAs : 'email'
            })

            .when('/logout', {
                templateUrl : '/app/views/pages/user-logout.html',
                authenticated : false
            })

            .when('/transactions', {
                templateUrl : '/app/views/pages/user-transactions.html',
                authenticated : true,
                controller: 'transactionsCtrl',
                controllerAs : 'transactions'
            })

            .when('/subjects', {
                templateUrl : '/app/views/pages/user-subjects.html',
                authenticated : true,
                controller : 'subjectCtrl',
                controllerAs : 'subject'
            })

            .when('/students', {
                templateUrl : '/app/views/pages/user-students.html',
                authenticated : true,
                controller : 'studentCtrl',
                controllerAs : 'student'
            })

            .when('/students/:code', {
                templateUrl : '/app/views/pages/user-subject-students.html',
                authenticated : true,
                controller : 'studentSubjectCtrl',
                controllerAs : 'studentSubject'
            })

            .when('/addsubject', {
                templateUrl : '/app/views/pages/user-add-subject.html',
                authenticated : true,
                permission : 'professor',
                controller : 'subjectCtrl',
                controllerAs : 'subject'
            })

            .when('/joinsubject', {
                templateUrl : '/app/views/pages/user-join-subject.html',
                authenticated : true,
                controller : 'subjectCtrl',
                controllerAs : 'subject'
            })

            .when('/e-shop', {
                templateUrl : '/app/views/pages/user-e-shop.html',
                authenticated : true,
                permission : 'student'
            })

            .when('/sell-items' , {
                templateUrl : '/app/views/pages/user-sell-items.html',
                authenticated : true,
                permission : 'student',
                controller : 'eshopsellCtrl',
                controllerAs : 'eshopsell'
            })

            .when('/buy-items' , {
                templateUrl : '/app/views/pages/user-buy-items.html',
                authenticated : true,
                permission : 'student',
                controller : 'eshopbuyCtrl',
                controllerAs : 'eshopbuy'
            })

            .when('/item/:id' , {
                templateUrl : '/app/views/pages/user-item.html',
                authenticated : true,
                permission : 'student',
                controller : 'useritemCtrl',
                controllerAs : 'useritem'
            })

            .when('/bought-items' , {
                templateUrl : '/app/views/pages/user-bought-items.html',
                authenticated : true,
                permission : 'student',
                controller : 'boughtCtrl',
                controllerAs : 'bought'
            })

            .when('/posted-items' , {
                templateUrl : '/app/views/pages/user-posted-items.html',
                authenticated : true,
                permission : 'student',
                controller : 'postedCtrl',
                controllerAs : 'posted'
            })

            /*
            .when('/register', {
                templateUrl : '/app/views/users/register.html',
                controller : 'regCtrl',
                controllerAs : 'register',
                authenticated : false
            })

            .when('/forgot', {
                templateUrl : '/app/views/users/forgot.html',
                authenticated : false,
                controller : 'forgotCtrl',
                controllerAs : 'forgot'
            })

            .when('/forgotPassword/:token', {
                templateUrl : 'app/views/users/resetPassword.html',
                authenticated : false,
                controller : 'resetCtrl',
                controllerAs : 'reset'
            })

            .when('/resend', {
                templateUrl : '/app/views/users/activation/resend.html',
                authenticated : false,
                controller : 'resendCtrl',
                controllerAs : 'resend'
            })

            .when('/activate/:token', {
                templateUrl : '/app/views/users/activation/activate.html',
                authenticated : false,
                controller : 'emailCtrl',
                controllerAs : 'email'
            })

            .when('/logout', {
                templateUrl : '/app/views/users/logout.html',
                authenticated : false
            })

            */



            .when('/users/:username', {
                templateUrl : '/app/views/users/userProfile.html',
                authenticated : true
            })

            .when('/management', {
                templateUrl : 'app/views/admin/management.html',
                authenticated : true,
                controller : 'managementCtrl',
                controllerAs : 'management',
                permission : 'admin'
            })

            .when('/edit/:id', {
                templateUrl : 'app/views/admin/edit.html',
                authenticated : true,
                controller : 'editCtrl',
                controllerAs : 'edit',
                permission : 'admin'
            })


            .otherwise( { redirectTo : '/'});

        $locationProvider.html5Mode({
            enabled : true,
            requireBase : false
        })
    });

app.run(['$rootScope','auth','$location', 'user', function ($rootScope,auth,$location,user) {

    $rootScope.$on('$routeChangeStart', function (event, next, current) {

        if(next.$$route) {

            if(next.$$route.authenticated === true) {

                if(!auth.isLoggedIn()) {
                    event.preventDefault();
                    $location.path('/');
                } else if(next.$$route.permission) {

                    user.getPermission().then(function (data) {

                        if(next.$$route.permission !== data.data.permission) {
                            event.preventDefault();
                            $location.path('/');
                        }

                    });
                }

            } else if(next.$$route.authenticated === false) {

                if(auth.isLoggedIn()) {
                    event.preventDefault();
                    $location.path('/profile');
                }

            } /*else {
                console.log('auth doesnot matter');
            }
            */
        } /*else {
            console.log('Home route is here');
        }
*/
    })
}]);

app.filter('reverse', function() {
    return function(items) {
        return items.slice().reverse();
    };
});

