# react-app-rewire-less-modules

Add [CSS Module](https://github.com/css-modules/css-modules) loaders to your
[create-react-app](https://github.com/facebookincubator/create-react-app) via
[react-app-rewired](https://github.com/timarney/react-app-rewired).

CSS Module styles can be written in CSS or LESS.

## Installation

```
npm install --save-dev react-app-rewire-less-modules
```

OR

```
yarn add --dev react-app-rewire-less-modules
```

## Usage

Use the following file extensions for any CSS Modules styles:

* `*.module.css`
* `*.module.less`

Files with the following file extensions will load normally, without the CSS
Modules loader:

* `*.css`
* `*.less`

### Example

In your react-app-rewired configuration:

```javascript
/* config-overrides.js */

const rewireLess = require("react-app-rewire-less-modules");

module.exports = function override(config, env) {
  // ...
  config = rewireLess(config, env);
  // with loaderOptions
  // config = rewireLess.withLoaderOptions('', someLoaderOptions)(config, env);
  // with override localIdentName
  // config = rewireLess.withLoaderOptions(
  //   `${env === "production" ? "foobar" : "[local]"}-[hash:base64:8]`,
  //)(config, env);
  // ...
  return config;
};
```

In your React application:

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
import styles from './App.module.scss';

export default ({text}) => (
    <div className={styles.app}>{text}</div>
)
```
