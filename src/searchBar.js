"use strict";

var _ = require("lodash");

/**
 * @module SearchBar
 * @param database
 * @param onFetchQuery
 * @description Search input for movie search application
 */
var SearchBar = function(database, onFetchQuery) {
  this.init();
  this.database = database;
  this.onFetchQuery = onFetchQuery;
};

SearchBar.prototype = {
  /**
   * @method init
   * @description Initialize event listener for search
   * input and wrap it with a debouncer to limit
   * number of api hits
   */
  init: function() {
    var self = this;
    var search = document.getElementById("movieSearch");
    var handleSearch = _.debounce(function(response) {
      var query = response.target.value;
      var cachedQuery = self.database.fetchCachedQuery(query);
      cachedQuery.then(function(results) {
        return results && results.length > 0
          ? self.onFetchQuery(results)
          : self.searchForMovie(query);
      });
    }, 250);

    search.addEventListener("keydown", handleSearch);
  },
  /**
   * @method searchForMovie
   * @param query
   * @description Fetch movies for uncached query
   */
  searchForMovie(query) {
    var self = this;

    var regexp = new RegExp("[0-9A-Za-z]");
    if (!regexp.test(query)) {
      return Promise.resolve({
        error: "Please enter only letters and numbers"
      });
    }

    var imdbAPI = "http://www.omdbapi.com/?apikey=aba065d3&s=" + query;

    return fetch(imdbAPI, { method: "get" })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (data && data.Search) {
          var movies = _.filter(data.Search, function(movie) {
            return movie.Poster !== "N/A";
          });
          // Save to cache if not yet saved
          self.database.cacheQuery(query, movies);
          self.onFetchQuery(movies);
        }
      })
      .catch(function(err) {
        return err;
      });
  }
};

module.exports = SearchBar;
