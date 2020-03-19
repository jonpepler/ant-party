# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.3.0](https://github.com/jonpepler/ant-party/compare/v0.2.1...v0.3.0) (2020-03-19)


### Features

* 🎸 Delete player record when they quit ([172b32f](https://github.com/jonpepler/ant-party/commit/172b32feff92175a3dde8bc71e15883d75397c6b))
* 🎸 Only allow game admin from the game host ([12cd6cd](https://github.com/jonpepler/ant-party/commit/12cd6cd0228873ad1c1c78910b60f5c6d714054c))
* 🎸 Reflect submitted ant.js files back to the players ([4bfa470](https://github.com/jonpepler/ant-party/commit/4bfa470f1a2598ec3c2588064339c054066f6713))
* 🎸 Show a start button when enough players have joined ([4034ab8](https://github.com/jonpepler/ant-party/commit/4034ab8cf94869e480bcf108de35a97ed0c0abfa))
* 🎸 Show a very basic p5 canvas on game start ([a8fa6dd](https://github.com/jonpepler/ant-party/commit/a8fa6ddf04de46035e3186a2ab7e4396ff273431))
* 🎸 Show basic ants and dirt in scalable P5 demo ([816ab5e](https://github.com/jonpepler/ant-party/commit/816ab5e87a3fa78ed4659e6833ddfc80cf7c3a3b))
* 🎸 Show connection error in footer when con fails happen ([8e2e666](https://github.com/jonpepler/ant-party/commit/8e2e6667d51906591de96168da628f8329428859))
* 🎸 Start game when instructed by host ([2df4b93](https://github.com/jonpepler/ant-party/commit/2df4b9312edf77d54bfa83a509d23a746f814271))


### Bug Fixes

* 🐛 Add missing dependencies (p5/react-p5) ([5743e15](https://github.com/jonpepler/ant-party/commit/5743e155e773491196a2cfd3af47bbe09f08767e))

### [0.2.1](https://github.com/jonpepler/ant-party/compare/v0.2.0...v0.2.1) (2020-03-08)

## [0.2.0](https://github.com/jonpepler/ant-party/compare/v0.1.2...v0.2.0) (2020-03-08)


### Features

* 🎸 Show player IDs in web client when they join ([f5eef4c](https://github.com/jonpepler/ant-party/commit/f5eef4ce61b4eaf2c770fd7bac10ee3df935f4fa))
* 🎸 Show player names when they join a game ([1acd87b](https://github.com/jonpepler/ant-party/commit/1acd87bac06647f1a4989d7601474edcd95e49d6))
* 🎸 Track when players leave and show in the web view ([b732404](https://github.com/jonpepler/ant-party/commit/b73240455720d7e6899c3641b4bbc59d9bfb25f4))


### Bug Fixes

* 🐛 Fix redis dev script attempting to run the application ([47517a3](https://github.com/jonpepler/ant-party/commit/47517a3f112e464c028f371cf107440aaf578d35))

### [0.1.2](https://github.com/jonpepler/ant-party/compare/v0.1.1...v0.1.2) (2020-03-07)

### [0.1.1](https://github.com/jonpepler/ant-party/compare/v0.0.3...v0.1.1) (2020-03-07)


### Features

* 🎸 Receive game join requests over socket ([379c4c7](https://github.com/jonpepler/ant-party/commit/379c4c7d713092c062bacdebab7e256e9c42555b))
* 🎸 Track game events via socket tracker in client ([065a5df](https://github.com/jonpepler/ant-party/commit/065a5df2a56980f194db6da48b29c2871fe1fc21))

### [0.0.3](https://github.com/jonpepler/ant-party/compare/v0.0.2...v0.0.3) (2020-03-06)


### Features

* 🎸 Add a basic start game flow ([6726e4f](https://github.com/jonpepler/ant-party/commit/6726e4f7f9562e818bef5d2d3733cb03dd10ffe1))
* 🎸 Add a hover effect on buttons ([795c401](https://github.com/jonpepler/ant-party/commit/795c4010788c21c319744ac5ca962a1b25c9f5fc))
* 🎸 Allow players to join a game via ant-party-client ([3147632](https://github.com/jonpepler/ant-party/commit/3147632198ce82d4c74e1ba26ca7c50ec6322891))
* 🎸 Return a game code when starting a game ([df23a60](https://github.com/jonpepler/ant-party/commit/df23a60ea5563eba75cc7ee145cf24daff360271))
* 🎸 Update all terminology to refer to Games and gamecodes ([a85df7e](https://github.com/jonpepler/ant-party/commit/a85df7ed4731a92294c32cbad403352f1fe2c793))
* 🎸 Use a secure cookie in production ([675106b](https://github.com/jonpepler/ant-party/commit/675106bf5244d7fb2ca4d8140519ba256f2d91cb))


### Bug Fixes

* 🐛 Correct client build path ([79acbef](https://github.com/jonpepler/ant-party/commit/79acbef9f3a1833bb44b282b58b071e018b0f714))
* 🐛 Make node-sass a regular dependency ([41f2dab](https://github.com/jonpepler/ant-party/commit/41f2dab67c70d856c2d72a41f7b14be288639d40))

### [0.0.2](https://github.com/jonpepler/ant-party/compare/v0.0.1...v0.0.2) (2020-03-02)


### Features

* 🎸 Add a simple create-react-app web frontend ([711d8e1](https://github.com/jonpepler/ant-party/commit/711d8e12d8a62afdbe74032a5ae30fe8557e12dc))

### [0.0.1](https://github.com/jonpepler/ant-party/compare/v0.0.0...v0.0.1) (2020-03-01)


### Features

* 🎸 Return the version number on the test endpoint ([e3f4de4](https://github.com/jonpepler/ant-party/commit/e3f4de4ead66e709d06a876a3e3def684e1def26))


### Bug Fixes

* 🐛 Expose custom function errors to client better ([8e13881](https://github.com/jonpepler/ant-party/commit/8e1388135028a05d0ab6cfa981e827739723e217))

## 0.0.0 (2020-02-28)


### Features

* 🎸 Create basic Node app ([7a33e3b](https://github.com/jonpepler/ant-party/commit/7a33e3b61970ac77eafc94970a99ecbfb4b1a2ce))
* 🎸 Support (secure) arbitrary code execution over http ([fe1f7cf](https://github.com/jonpepler/ant-party/commit/fe1f7cf9e265298b1f33b7a02952841164cb3869))


### Bug Fixes

* 🐛 Set license to genuine SPDX format ([9b51708](https://github.com/jonpepler/ant-party/commit/9b51708184b10b56ddd71f79d8fc1486ecec7a16))
