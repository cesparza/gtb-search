'use strict';

// Declare app level module which depends on views, and components
angular.module('photoSearchApp', [
  'ngRoute',
  'photoSearchApp.main',
  'ngResource',
  'elasticsearch',
  'wu.masonry',
  'color.picker'
  ]).
config(['$routeProvider', function($routeProvider) {
$routeProvider.otherwise({redirectTo: '/main'});
}]).
config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode(true);
}])
.factory('photoService', ['$q', 'esFactory', '$location', function($q, elasticsearch, $location) {
  var client = elasticsearch({
    host: '45.55.229.227:9200'
  });

  /**
   * Given a term and an offset, load another round of 10 photos.
   *
   * Returns a promise.
   */
   var search = function(term, offset) {
    term = term || "";
    /* TODO: This should accomodate a term and a the current color search in the future */
    var deferred = $q.defer();
    var query = {
          
        "query_string": {
            "query": "*"+term+"*",
            "fields": ["image_description_search", "artist_search", "file_name_search", "x_resolution", "y_resolution"]
        }
          
      };

    client.search({
        index: 'photos',
        type: 'photo',
        body: {
          size: 10,
          from: (offset || 0) * 10,
          query: query
        }
      }).then(function(result) {
        var ii = 0, hits_in, hits_out = [];

        hits_in = (result.hits || {}).hits || [];

        for(; ii < hits_in.length; ii++) {
          hits_out.push(hits_in[ii]._source);
        }
        deferred.resolve(hits_out);
      }, deferred.reject);

      return deferred.promise;
    };

  // Since this is a factory method, we return an object representing the actual service.
  return {
    search: search
  };

}]);
