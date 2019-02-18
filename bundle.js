(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var idb = require("idb");

var IdbConnection = function() {
  return this.init();
};

IdbConnection.prototype = {
  init: function() {
    //check for support
    if (!("indexedDB" in window)) {
      console.log("This browser doesn't support IndexedDB");
      return;
    }

    var storeName = "loaded-movies";
    var dbPromise = idb
      .openDb("movie-search-db", 1, function(db) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      })
      .catch(function(err) {
        return err;
      });

    this.storeName = "loaded-movies";
    this.connection = dbPromise;
    this.fetchCachedQuery = this.fetchCachedQuery.bind(this);
    this.cacheQuery = this.cacheQuery.bind(this);

    return {
      storeName: this.storeName,
      connection: this.connection,
      fetchCachedQuery: this.fetchCachedQuery,
      cacheQuery: this.cacheQuery
    };
  },
  fetchCachedQuery: function(query) {
    return this.connection
      .then(function(db) {
        if (db.objectStoreNames.contains(this.storeName)) {
          var tx = db.transaction(this.storeName, "readonly");
          return tx.objectStore(this.storeName).get(query);
        }
        return Promise.resolve([]);
      })
      .catch(function(err) {
        return err;
      });
  },
  cacheQuery: function(query, movies) {
    if (!movies) {
      return Promise.resolve();
    }

    return this.connection
      .then(function(db) {
        if (db.objectStoreNames.contains(this.storeName)) {
          var tx = db.transaction(this.storeName, "readwrite");

          tx.objectStore(this.storeName).put(movies, query);
          return tx.complete;
        }
        return Promise.resolve();
      })
      .catch(function(err) {
        return err;
      });
  }
};

module.exports = IdbConnection;

},{"idb":3}],2:[function(require,module,exports){
"use strict";
var IdbConnection = require("./idbConnection.js");
var SearchBar = require("./searchBar.js");

/**********************************************************************************************************************
 * @method displayMovies
 */
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

},{"./idbConnection.js":1,"./searchBar.js":4}],3:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.idb = {}));
}(this, function (exports) { 'use strict';

  function toArray(arr) {
    return Array.prototype.slice.call(arr);
  }

  function promisifyRequest(request) {
    return new Promise(function(resolve, reject) {
      request.onsuccess = function() {
        resolve(request.result);
      };

      request.onerror = function() {
        reject(request.error);
      };
    });
  }

  function promisifyRequestCall(obj, method, args) {
    var request;
    var p = new Promise(function(resolve, reject) {
      request = obj[method].apply(obj, args);
      promisifyRequest(request).then(resolve, reject);
    });

    p.request = request;
    return p;
  }

  function promisifyCursorRequestCall(obj, method, args) {
    var p = promisifyRequestCall(obj, method, args);
    return p.then(function(value) {
      if (!value) return;
      return new Cursor(value, p.request);
    });
  }

  function proxyProperties(ProxyClass, targetProp, properties) {
    properties.forEach(function(prop) {
      Object.defineProperty(ProxyClass.prototype, prop, {
        get: function() {
          return this[targetProp][prop];
        },
        set: function(val) {
          this[targetProp][prop] = val;
        }
      });
    });
  }

  function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return this[targetProp][prop].apply(this[targetProp], arguments);
      };
    });
  }

  function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyCursorRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function Index(index) {
    this._index = index;
  }

  proxyProperties(Index, '_index', [
    'name',
    'keyPath',
    'multiEntry',
    'unique'
  ]);

  proxyRequestMethods(Index, '_index', IDBIndex, [
    'get',
    'getKey',
    'getAll',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(Index, '_index', IDBIndex, [
    'openCursor',
    'openKeyCursor'
  ]);

  function Cursor(cursor, request) {
    this._cursor = cursor;
    this._request = request;
  }

  proxyProperties(Cursor, '_cursor', [
    'direction',
    'key',
    'primaryKey',
    'value'
  ]);

  proxyRequestMethods(Cursor, '_cursor', IDBCursor, [
    'update',
    'delete'
  ]);

  // proxy 'next' methods
  ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {
    if (!(methodName in IDBCursor.prototype)) return;
    Cursor.prototype[methodName] = function() {
      var cursor = this;
      var args = arguments;
      return Promise.resolve().then(function() {
        cursor._cursor[methodName].apply(cursor._cursor, args);
        return promisifyRequest(cursor._request).then(function(value) {
          if (!value) return;
          return new Cursor(value, cursor._request);
        });
      });
    };
  });

  function ObjectStore(store) {
    this._store = store;
  }

  ObjectStore.prototype.createIndex = function() {
    return new Index(this._store.createIndex.apply(this._store, arguments));
  };

  ObjectStore.prototype.index = function() {
    return new Index(this._store.index.apply(this._store, arguments));
  };

  proxyProperties(ObjectStore, '_store', [
    'name',
    'keyPath',
    'indexNames',
    'autoIncrement'
  ]);

  proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'put',
    'add',
    'delete',
    'clear',
    'get',
    'getAll',
    'getKey',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'openCursor',
    'openKeyCursor'
  ]);

  proxyMethods(ObjectStore, '_store', IDBObjectStore, [
    'deleteIndex'
  ]);

  function Transaction(idbTransaction) {
    this._tx = idbTransaction;
    this.complete = new Promise(function(resolve, reject) {
      idbTransaction.oncomplete = function() {
        resolve();
      };
      idbTransaction.onerror = function() {
        reject(idbTransaction.error);
      };
      idbTransaction.onabort = function() {
        reject(idbTransaction.error);
      };
    });
  }

  Transaction.prototype.objectStore = function() {
    return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
  };

  proxyProperties(Transaction, '_tx', [
    'objectStoreNames',
    'mode'
  ]);

  proxyMethods(Transaction, '_tx', IDBTransaction, [
    'abort'
  ]);

  function UpgradeDB(db, oldVersion, transaction) {
    this._db = db;
    this.oldVersion = oldVersion;
    this.transaction = new Transaction(transaction);
  }

  UpgradeDB.prototype.createObjectStore = function() {
    return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
  };

  proxyProperties(UpgradeDB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(UpgradeDB, '_db', IDBDatabase, [
    'deleteObjectStore',
    'close'
  ]);

  function DB(db) {
    this._db = db;
  }

  DB.prototype.transaction = function() {
    return new Transaction(this._db.transaction.apply(this._db, arguments));
  };

  proxyProperties(DB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(DB, '_db', IDBDatabase, [
    'close'
  ]);

  // Add cursor iterators
  // TODO: remove this once browsers do the right thing with promises
  ['openCursor', 'openKeyCursor'].forEach(function(funcName) {
    [ObjectStore, Index].forEach(function(Constructor) {
      // Don't create iterateKeyCursor if openKeyCursor doesn't exist.
      if (!(funcName in Constructor.prototype)) return;

      Constructor.prototype[funcName.replace('open', 'iterate')] = function() {
        var args = toArray(arguments);
        var callback = args[args.length - 1];
        var nativeObject = this._store || this._index;
        var request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
        request.onsuccess = function() {
          callback(request.result);
        };
      };
    });
  });

  // polyfill getAll
  [Index, ObjectStore].forEach(function(Constructor) {
    if (Constructor.prototype.getAll) return;
    Constructor.prototype.getAll = function(query, count) {
      var instance = this;
      var items = [];

      return new Promise(function(resolve) {
        instance.iterateCursor(query, function(cursor) {
          if (!cursor) {
            resolve(items);
            return;
          }
          items.push(cursor.value);

          if (count !== undefined && items.length == count) {
            resolve(items);
            return;
          }
          cursor.continue();
        });
      });
    };
  });

  function openDb(name, version, upgradeCallback) {
    var p = promisifyRequestCall(indexedDB, 'open', [name, version]);
    var request = p.request;

    if (request) {
      request.onupgradeneeded = function(event) {
        if (upgradeCallback) {
          upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
        }
      };
    }

    return p.then(function(db) {
      return new DB(db);
    });
  }

  function deleteDb(name) {
    return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
  }

  exports.openDb = openDb;
  exports.deleteDb = deleteDb;

  Object.defineProperty(exports, '__esModule', { value: true });

}));

},{}],4:[function(require,module,exports){
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

},{}]},{},[2]);
