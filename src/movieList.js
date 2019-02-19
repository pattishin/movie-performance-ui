"use strict";
/**
 * @module MovieList
 * @description Displays given movie list
 */
var MovieList = function() {
  return this.init();
};

MovieList.prototype = {
  /**
   * @method init
   * @param movies
   * @description Initializing available functions
   */
  init: function(movies) {
    this.displayList = this.displayList.bind(this);
    this.resetList = this.resetList.bind(this);

    return {
      displayList: this.displayList,
      resetList: this.resetList
    };
  },
  /**
   * @method displayList
   * @param query
   * @param results
   * @description Inject into DOM list of given movie results
   * or displays no results prompt if none are passed
   */
  displayList: function(query, results) {
    var movieList = document.querySelector(".MovieSearch-movieList");
    var movieTotal = document.querySelector(".MovieSearch-total");
    var hasResults = results && !results.error && query !== "";

    this.resetList().then(function() {
      if (hasResults) {
        movieTotal.innerHTML = "<p>" + results.length + " found</p>";
        results.forEach(function(movie, index) {
          var movieInfo = movie.Title + " " + movie.Type + " " + movie.Year;
          var movieItem = document.createElement("div");
          movieItem.setAttribute("class", "MovieSearch-movieItem");

          // Create new image element for movie poster
          var movieImage = document.createElement("img");
          movieImage.setAttribute("src", movie.Poster);
          movieImage.setAttribute("title", movieInfo);
          movieImage.setAttribute("alt", movieInfo);
          movieImage.setAttribute("class", "MovieSearch-movieItem-poster");

          //Create new header for movie item
          var movieHeader = document.createElement("div");
          movieHeader.setAttribute("class", "MovieSearch-movieItem-header");
          movieHeader.innerHTML =
            "<p>" +
            movie.Title +
            " (" +
            movie.Year +
            ")</p><p>" +
            movie.Type +
            "</p>";

          // Add image/header to movie item element
          movieItem.appendChild(movieImage);
          movieItem.appendChild(movieHeader);

          // Add movie item element to existing movie list
          movieList.appendChild(movieItem);
        });
      } else {
        var noResults = document.createElement("div");
        noResults.setAttribute("class", "MovieSearch-noResults");
        noResults.innerHTML =
          '<img src="./img/popcorn-movie-time-2.png" /><p>No movies found</p>';
        movieTotal.innerHTML = "";
        movieList.appendChild(noResults);
      }
    });
  },
  /**
   * @method resetList
   * @description Removes node children (movie items) from
   * target parent (movie list)
   */
  resetList: function() {
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
};

module.exports = MovieList;
