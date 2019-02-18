"use strict";

var SearchBar = function(database, onFetchQuery) {
  this.init();
  this.database = database;
  this.onFetchQuery = onFetchQuery;
};

SearchBar.prototype = {
  init: function() {
    var self = this;
    var search = document.getElementById("movieSearch");
    // Add debounce to the API calls
    search.addEventListener("search", function(response) {
      var query = response.target.value;
      if (self.database) {
        self.database.fetchCachedQuery(query).then(function(results) {
          return results && results.length > 0
            ? self.onFetchQuery(results)
            : self.searchForMovie(query);
        });
      } else {
        debugger;
        self.searchForMovie(query);
      }
    });
  },
  searchForMovie(query) {
    var self = this;
    var imdbAPI = "http://www.omdbapi.com/?apikey=aba065d3&s=" + query;

    return fetch(imdbAPI, { method: "get" })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        var movies = data.Search;
        // Save to cache if not yet saved
        if (self.database) {
          self.database.cacheQuery(query, movies);
        }
        self.onFetchQuery(movies);
      })
      .catch(function(err) {
        return err;
      });
  }
};

module.exports = SearchBar;
