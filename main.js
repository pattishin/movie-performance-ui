"use strict";
var IdbConnection = require("./idbConnection.js");
var SearchBar = require("./searchBar.js");

function displayMovies(movies) {
  var target = document.querySelector(".MovieSearch-movieList");

  resetMovies().then(function() {
    if (movies) {
      movies.forEach(function(movie, index) {
        var movieInfo = movie.Title + " " + movie.Type + " " + movie.Year;
        var newElement = document.createElement("div");
        newElement.setAttribute("class", "MovieSearch-movieItem");
        newElement.innerHTML =
          '<img src="' +
          movie.Poster +
          '" title="' +
          movieInfo +
          '" alt="' +
          movieInfo +
          '"/>';
        target.appendChild(newElement);
      });
    } else {
      var emptyElement = document.createElement("div");
      emptyElement.setAttribute("class", "MovieSearch-noResults");
      emptyElement.innerHTML =
        '<img src="./popcorn-movie-time_2.png" /><p>No movies found</p>';
      target.appendChild(emptyElement);
    }
  });
}

/**
 * @method resetMovies
 */
function resetMovies() {
  var target = document.querySelector(".MovieSearch-movieList");
  return new Promise(function(resolve, reject) {
    while (target.firstChild) {
      target.removeChild(target.firstChild);
    }
    if (!target.firstChild) {
      return resolve();
    }
  });
}

/**
 * @method main
 */
(function main() {
  var database = new IdbConnection();
  var searchBar = new SearchBar(database, function(results) {
    displayMovies(results);
  });
})();
