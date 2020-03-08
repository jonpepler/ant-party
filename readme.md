[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Ant Party

## dev

This project relies on a redis server. When running the scripts below, a script will be called that runs a redis Docker image.
To start the dev server (client & backend), run:

```bash
npm i
npm run dev
```

This runs the dev server on port `8000` and you can view it here:

http://localhost:8000/api/v1/test/

...and then seperately run the client in the `./client` subdirectory:

```bash
cd ./client
npm i
npm run serve
```

http://localhost:3000/ should now host the app, and suport hot reloading.

## contributing

Hopefully this project can remain [Commitizen friendly](http://commitizen.github.io/cz-cli/).

In short, to commit, run:

```bash
npx git-cz
```