# react-app-rewire-css-modules

Add [CSS Module](https://github.com/css-modules/css-modules) loaders to your [create-react-app](https://github.com/facebookincubator/create-react-app) via [react-app-rewired](https://github.com/timarney/react-app-rewired).

CSS Module styles can be written in CSS or SASS and LESS.

## Installation

This package is not yet published to the npm registry. Install from GitHub:

```
yarn add --dev LuHugo/react-app-rewire-css-modules sass-loader node-sass less less-loader
```

OR

```
npm install --save-dev LuHugo/react-app-rewire-css-modules sass-loader node-sass less less-loader
```

## Usage

Use the following file extensions for any CSS Modules styles:

- `*.module.css`
- `*.module.sass`
- `*.module.scss`
- `*.module.less`

Files with the following file extensions will load normally, without the CSS Modules loader:

- `*.css`
- `*.sass`
- `*.scss`
- `*.less`

### Example

In your react-app-rewired configuration:

```javascript
/* config-overrides.js */

const rewireCssModules = require('react-app-rewire-css-modules');

module.exports = function override(config, env) {
    // default
    config = rewireCssModules(config, env);
    // OR with loader options
    // config = rewireCssModules.withLoaderOptions({css: { localIdentName: '[name]__[local]___[hash:base64:8]' }, less: { javascriptEnabled: true }})(config, env)
    return config;
}
```

In your React application:

```scss
// src/App.module.scss

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
import styles from './App.module.scss';

export default ({text}) => (
    <div className={styles.app}>{text}</div>
)
```

```less
// src/App.module.less

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
import styles from './App.module.less';

export default ({text}) => (
    <div className={styles.app}>{text}</div>
)
```
