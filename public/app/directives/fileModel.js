angular.module('fileModelDirective', [])

.directive('fileModel',['$parse', function ($parse) {

    return {
        // restrict it to only attributes
        restrict : 'A',
        link : function (scope, element, attrs) {
            var parsedFile = $parse(attrs.fileModel);
            var parsedFileSetter = parsedFile.assign;

            // when ever file changes it updates the scope
            element.bind('change', function () {
                // parsing the file and updating the scope
                scope.$apply(function () {
                    parsedFileSetter(scope, element[0].files[0])
                })
            })
        }
    }
}]);