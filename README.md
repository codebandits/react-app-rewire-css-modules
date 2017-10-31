# react-app-rewire-css-modules

Add [CSS Module](https://github.com/css-modules/css-modules) loaders to your [create-react-app](https://github.com/facebookincubator/create-react-app) via [react-app-rewired](https://github.com/timarney/react-app-rewired).

CSS Module styles can be written in CSS or SASS.

## Installation

This package is not yet published to the npm registry. Install from GitHub:

```
yarn add --dev codebandits/react-app-rewire-css-modules sass-loader node-sass
```

OR

```
npm install --save-dev codebandits/react-app-rewire-css-modules sass-loader node-sass
```

## Usage

In your react-app-rewired configuration:

```javascript
/* config-overrides.js */

const rewireCssModules = require('react-app-rewire-css-modules');

module.exports = function override(config, env) {
    // ...
    config = rewireCssModules(config, env);
    // ...
    return config;
}
```

In your React application:

```scss
// src/App.scss

.app {
  color: aqua;
  
  &:hover {
    color: lawngreen;
  }
}
```

```jsx harmony
// src/App.js

import React from 'react';
import styles from './App.scss';

export default ({text}) => (
    <div className={styles.app}>{text}</div>
)
```
