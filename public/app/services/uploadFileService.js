
angular.module('uploadFileService', [])

.service('uploadFile', function ($http) {

    this.upload = function (file) {

        // FormData is like key value pair
        var fd = new FormData();
        fd.append('myFile', file.upload);

        return $http.post('/api/upload', fd, {
            // angular serializes the data. TO remove that
            transformRequest : angular.identity,
            headers : {
                'Content-type' : undefined
            }
        });
    }
});