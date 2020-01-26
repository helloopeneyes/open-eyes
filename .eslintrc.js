module.exports = {
  parser: "babel-eslint",
  env: { es6: true, browser: true, node: true },
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "prefer-const": "error",
    "no-use-before-define": "error",
    "no-var": "error",
    "react/prop-types": "off"
  },
  extends: ["prettier", "eslint:recommended", "plugin:react/recommended"],
  settings: {
    react: { version: "detect" }
  }
};
