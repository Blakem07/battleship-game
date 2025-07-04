export default {
  transform: {
    "^.+\\.jsx?$": "babel-jest", // Transforms .js and .jsx files using babel-jest
  },
  watchPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/coverage/",
    "<rootDir>/.vscode/",
    "\\.git/",
    "\\.DS_Store",
  ],
};
