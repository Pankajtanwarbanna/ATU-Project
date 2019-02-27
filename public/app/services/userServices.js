/*
    Services written by - Pankaj tanwar
*/
angular.module('userServices',[])

.factory('user', function ($http) {
    var userFactory = {};

    // user.create(regData);
    userFactory.create = function (regData) {
        return $http.post('/api/register' , regData);
    };

    // user.activateAccount(token);
    userFactory.activateAccount = function (token) {
        return $http.put('/api/activate/'+token);
    };

    // user.resendLink(logData);
    userFactory.checkCredientials = function (logData) {
        return $http.post('/api/resend',logData);
    };

    // user.resendEmail(username);
    userFactory.resendEmail = function (username) {
        return $http.put('/api/sendlink', username);
    };

    // user.forgotUsername(email);
    userFactory.forgotUsername = function (email) {
        return $http.post('/api/forgotUsername', email);
    };

    // user.forgotPasswordLink(username);
    userFactory.forgotPasswordLink = function (username) {
        return $http.put('/api/forgotPasswordLink', username);
    };

    // user.forgotPasswordCheckToken(token);
    userFactory.forgotPasswordCheckToken = function (token) {
        return $http.post('/api/forgotPassword/'+token);
    };

    // user.resetPassword(token,password);
    userFactory.resetPassword = function (token,password) {
        return $http.put('/api/resetPassword/'+token, password);
    };

    // user.getPermission();
    userFactory.getPermission = function () {
        return $http.get('/api/permission');
    };

    // get users from database
    userFactory.getUsers = function () {
        return $http.get('/api/management/');
    };

    // get user from id
    userFactory.getUser = function(id) {
        return $http.get('/api/edit/' + id);
    };

    //delete user from database
    userFactory.deleteUser = function (username) {
        return $http.delete('/api/management/'+username);
    };

    // edit details of user
    userFactory.editUser = function (id) {
        return $http.put('/api/edit/', id);
    };

    // Profile page of user
    userFactory.getProfile = function () {
        return $http.get('/api/getProfile');
    };

    // update user profile
    userFactory.doUpdate = function (profileData) {
        return $http.put('/api/doUpdate', profileData);
    };

    // add subject to database
    userFactory.addSubject = function (subjectData) {
        return $http.post('/api/addSubject', subjectData);
    };

    // get all subjects from database - professor
    userFactory.getSubjects = function () {
        return $http.get('/api/getSubjects');
    };

    // get all joined subjects - student
    userFactory.getJoinedSubjects = function() {
        return $http.get('/api/getJoinedSubjects');
    };

    // join a subject - student
    userFactory.joinSubject = function (subjectData) {
        return $http.post('/api/joinSubject', subjectData);
    };

    // get all subjects of a prof.
    userFactory.getProfSubjects = function () {
        return $http.get('/api/getProfSubjects');
    };

    // get students of a subject
    userFactory.getStudents = function (code) {
        return $http.get('/api/getStudents/' + code);
    };

    // add points of a user
    userFactory.addPoints = function (pointsObj) {
        return $http.post('/api/addPoints', pointsObj);
    };

    // deduct points of a user
    userFactory.deductPoints = function (pointsObj) {
        return $http.post('/api/deductPoints', pointsObj);
    };

    // get transactions of a user
    userFactory.getTransactions = function () {
        return $http.get('/api/getTransactions');
    };

    // get total points
    userFactory.getTotalPoints = function () {
        return $http.get('/api/getTotalPoints');
    };

    // post an item
    userFactory.postItem = function (itemData) {
        return $http.post('/api/postItem',itemData);
    };

    // get items from database
    userFactory.getItems = function () {
        return $http.get('/api/getItems');
    };

    // get personal page of item
    userFactory.getProduct = function (id) {
        return $http.get('/api/getProduct/' + id);
    };

    return userFactory;
});