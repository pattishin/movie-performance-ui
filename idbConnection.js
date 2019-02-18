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
