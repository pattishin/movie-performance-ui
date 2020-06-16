# movie-performance-ui

<div align="center">
  <img src="https://github.com/pattishin/movie-performance-ui/blob/master/img/screenshot.png" />
</div>
<p>Movie/ show search bar performance test</p>

## Description
Utilizes debounce and IndexedDB to minimize calls to omdb api.
Caching new query results into IndexedDB (with help of [idb npm module](https://github.com/jakearchibald/idb) by Jake Archibald) and re-fetching those results if user
enters in the same query, which should help performance where connection is slow. 

## Running locally

```shell
$ npm install # Install project dependencies listed in package.json
$ npm start
```

Open project at http://localhost:8000/ in a browser window.
