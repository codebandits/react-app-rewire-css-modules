# react-app-rewire-less-modules

Add Less and Less module support to
[create-react-app](https://github.com/facebookincubator/create-react-app) 2.0 via
[react-app-rewired](https://github.com/timarney/react-app-rewired).

`Create react app 2.0` already supports CSS modules. This extension adds support for regular less files and *.module.less files.

## Installation

```
npm install --save-dev react-app-rewire-less-modules
```

OR

```
yarn add --dev react-app-rewire-less-modules
```

## Usage

Use the following file extensions for any Less module styles:

* `*.module.less`

Files with the following file extensions will load normally, without the CSS
Modules loader:

* `*.less`

### Example

In your react-app-rewired configuration:

```javascript
/* config-overrides.js */

const rewireLess = require("react-app-rewire-less-modules");

module.exports = function override(config, env) {
  
  config = rewireLess(config, env);
  
  // with loaderOptions
  config = rewireLess.withLoaderOptions({
      modifyVars: {
        "@primary-color": "#1890ff",
      },
    })(config, env);

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
import styles from './App.module.less';

export default ({text}) => (
    <div className={styles.app}>{text}</div>
)
```
