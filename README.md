# Webpack Template

## Description

Webpack template allowing for a quicker start to development when using webpack

This webpack template handles:

- HTML
- CSS
- JavaScript
- IMGs (linked via css url())
- Fonts
- Webpack dev server

## Installation Instructions

1. Clone this repo:

   git clone clone https://github.com/Blakem07/webpack-template.git

2. Install dependencies:

   npm install
   npm init -y
   npm install --save-dev webpack webpack-cli
   npm install --save-dev html-webpack-plugin
   npm install --save-dev style-loader css-loader
   npm install --save-dev webpack-dev-server

## Usage

    To rebundle - npx webpack
    To run on live server - npx webpack serve
    To run server & jest concurrently - npm run dev

# Using Jest & Babel

npm install --save-dev babel-jest @babel/core @babel/preset-env

## Usage

    To run one test - npx jest
    To auto run tests on changes - npx jest --watchAll
    To run server & jest concurrently - npm run dev

## Running Tests

This project uses [Jest](https://jestjs.io/) for unit testing.

The `jsdom` environment is used to simulate a browser-like environment for tests involving the DOM or browser APIs. This is configured using a file-level directive:

```js
/**
 * @jest-environment jsdom
 */
```
