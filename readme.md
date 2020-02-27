[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Ant Party

## dev

To start the dev server (client & backend), run:

```bash
npm i
npm run dev
```

This runs the dev server on port `8000` and you can view it here...

http://localhost:8000/api/v1/test/

...and then seperately run the client in the `./client` subdirectory, run:

```bash
cd ./client
npm i
npm run serve
npm run test
```

Or from the root

```bash
npm i --prefix client
npm run serve --prefix client
npm test --prefix client
```

http://localhost:8080/ should now host the app, and suport hot reloading.

## contributing

Hopefully this project can remain [Commitizen friendly](http://commitizen.github.io/cz-cli/).

In short, to commit, run:

```bash
npx git-cz
```