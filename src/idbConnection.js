"use strict";

var idb = require("idb");

/**
 * @module IdbConnection
 * @description Module to create connection
 * with browser IndexedDB
 */
var IdbConnection = function() {
  this.storeName = "loaded-movies";
  return this.init();
};

IdbConnection.prototype = {
  /**
   * @method init
   * @description Opens connection with IndexedDB
   * and initializes available functions in module
   */
  init: function() {
    //check for support
    if (!("indexedDB" in window)) {
      console.log("This browser doesn't support IndexedDB");
      return;
    }

    var self = this;
    var dbPromise = idb
      .openDB("movie-search-db", 1, function(db) {
        if (!db.objectStoreNames.contains(self.storeName)) {
          db.createObjectStore(self.storeName);
        }
      })
      .catch(function(err) {
        return err;
      });

    this.connection = dbPromise;
    this.fetchCachedQuery = this.fetchCachedQuery.bind(this);
    this.cacheQuery = this.cacheQuery.bind(this);

    return {
      storeName: this.storeName,
      connection: this.connection,
      cacheQuery: this.cacheQuery,
      fetchCachedQuery: this.fetchCachedQuery
    };
  },

  /**
   * @method fetchCachedQuery
   * @param query
   * @method Retrieves results that match cached
   * query to limit multiple api calls
   */
  fetchCachedQuery: function(query) {
    if (!query) {
      return Promise.resolve();
    }

    var self = this;
    return this.connection
      .then(function(db) {
        if (db.objectStoreNames.contains(self.storeName)) {
          var tx = db.transaction(self.storeName, "readonly");
          return tx.objectStore(self.storeName).get(query);
        }
        return Promise.resolve([]);
      })
      .catch(function(err) {
        return err;
      });
  },

  /**
   * @method cacheQuery
   * @param query
   * @param movies
   * @description Save given query & associated
   * movie results into IndexedDB
   */
  cacheQuery: function(query, movies) {
    if (!movies || !query) {
      return Promise.resolve();
    }

    var self = this;
    return this.connection
      .then(function(db) {
        if (db.objectStoreNames.contains(self.storeName)) {
          var tx = db.transaction(self.storeName, "readwrite");
          tx.objectStore(self.storeName).put(movies, query);
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
