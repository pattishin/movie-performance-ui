"use strict";

var IdbConnection = require("./idbConnection.js");
var SearchBar = require("./searchBar.js");
var MovieList = require("./movieList.js");

/**
 * @method main
 * @description Initializes movie search application
 * creating a connection to IndexDB, a movie poster list,
 * and search bar
 */
(function main() {
  var database = new IdbConnection();
  var movieList = new MovieList();
  var searchBar = new SearchBar(database, function(results) {
    movieList.displayList(results);
  });
})();
