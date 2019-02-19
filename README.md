# movie-performance-ui

Movie/ show search challenge

## Description
Utilizes debounce and IndexedDB to minimize calls to omdb api.
Caching new query results into IndexedDB and re-fetching those results if user
enters in the same query, which should help performance where connection is slow. 

## Running locally

```shell
$ npm install # Install project dependencies listed in package.json
$ npm start
```

Open project at http://localhost:8000/ in a browser window.
