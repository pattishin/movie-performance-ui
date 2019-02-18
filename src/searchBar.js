"use strict";

var debounce = require("./helpers.js");

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
    var search = document.getElementById("MovieSearch-searchInput");
    var handleSearch = debounce(function(response) {
      var query = response.target.value;
      var cachedQuery = self.database.fetchCachedQuery(query);

      if (query === "") {
        self.onFetchQuery(query);
        return;
      }

      // Either uses cached movie data to serve up if available
      // or hits the omdb api to retrieve related movies
      cachedQuery.then(function(results) {
        return results && results.length > 0
          ? self.onFetchQuery(query, results)
          : self.searchForMovie(query);
      });
    }, 300);

    search.addEventListener("keydown", handleSearch);
    search.addEventListener("search", handleSearch);
  },
  /**
   * @method searchForMovie
   * @param query
   * @description Fetch movies for given query that
   * hasn't been cached yet
   */
  searchForMovie: function(query) {
    var self = this;

    // Filter input query
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
          var movies = data.Search.filter(function(movie) {
            return movie && movie.Poster && movie.Poster !== "N/A";
          });
          // Save to cache if not yet saved
          self.database.cacheQuery(query, movies);
          self.onFetchQuery(query, movies);
        }
      })
      .catch(function(err) {
        return err;
      });
  }
};

module.exports = SearchBar;
