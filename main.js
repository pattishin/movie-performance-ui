var idb = require('idb');

/**
 * @method displayMovies
 */
function displayMovies(movies) {
  var target = document.querySelector('.MovieSearch-movieList');
  
  resetMovies().then(function() {
    if (movies) {
      movies.forEach(function(movie, index) {
        var movieInfo = movie.Title + ' ' + movie.Type + ' ' + movie.Year;
        var newElement = document.createElement('div');
        newElement.setAttribute('class', 'MovieSearch-movieItem');
        newElement.innerHTML = '<img src="' + movie.Poster+ '" title="'+ movieInfo +'" alt="'+ movieInfo +'"/>';
        target.appendChild(newElement);
      });
    } else {
      var emptyElement = document.createElement('div');
      emptyElement.setAttribute('class', 'MovieSearch-noResults');
      emptyElement.innerHTML = '<img src="./popcorn-movie-time_2.png" /><p>No movies found</p>';
      target.appendChild(emptyElement);
    }
  });
}

/**
 * @method resetMovies
 */
function resetMovies() {
  var target = document.querySelector('.MovieSearch-movieList');
  return new Promise(function(resolve, reject) {
    while(target.firstChild) {
      target.removeChild(target.firstChild);
    }
    if (!target.firstChild) {
      return resolve();
    }
  });
}

/**
 * @method searchForMovie
 * @param query
 */
function searchForMovie(database, query) {
  var imdbAPI = 'http://www.omdbapi.com/?apikey=aba065d3&s=' + query;
  
  fetch(imdbAPI, { method: 'get' })
    .then(function(response) {
      return response.json(); 
    })
    .then(function(data) {
      var movies = data.Search;
      // Save to cache if not yet saved
      cacheQuery(database, query, movies)
      displayMovies(movies);
    })
    .catch(function(err) {
      console.log(err);
    });
}

/**
 * @method fetchCachedQuery
 */
function fetchCachedQuery(database, query) {
  return database.connection.then(function(db) { 
    if (db.objectStoreNames.contains(database.storeName)) { 
      var tx = db.transaction(database.storeName, 'readonly'); 
      return tx.objectStore(database.storeName).get(query); 
    }
    return Promise.resolve([]);
   })
  .catch(function(err) { console.log(err);}); 
}

/**
 * @method cacheQuery
 * @param query
 * @param results
 */
function cacheQuery(database, query, movies) {
  if (!movies) {
    return Promise.resolve(); 
  }
  
  return database.connection.then(function(db) {
    if (db.objectStoreNames.contains(database.storeName)) {
      var tx = db.transaction(database.storeName, 'readwrite');
        
      tx.objectStore(database.storeName).put(movies, query);
      return tx.complete;
    }
    return Promise.resolve();
  })
  .catch(function(err) {
    console.log(err);
  });
}

/**
 * @method createIdb
 */
function createIdb() {
 //check for support
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }

  var storeName = 'loaded-movies';
  var dbPromise = idb.openDb('movie-search-db', 1, function(db) {
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName);
    }
  })
  .catch(function(err) {
    console.log(err);
  });

  return {
    storeName: storeName,
    connection: dbPromise
  };

}

/**
 * @method main
 */
(function main() {
  var search = document.getElementById('movieSearch');
  var database = createIdb();

  // Add debounce to the API calls 
  search.addEventListener('search', function(response) {
    var query = response.target.value;
    var cached = fetchCachedQuery(database, query).then(function(results) { 
      return results && results.length > 0
        ? displayMovies(results)
        : searchForMovie(database, query);
    });
  });
}());
