const cloneDeep = require("lodash.clonedeep");
const path = require("path");

const ruleChildren = loader =>
  loader.use ||
  loader.oneOf ||
  (Array.isArray(loader.loader) && loader.loader) ||
  [];

const findIndexAndRules = (rulesSource, ruleMatcher) => {
  let result = undefined;
  const rules = Array.isArray(rulesSource)
    ? rulesSource
    : ruleChildren(rulesSource);
  rules.some(
    (rule, index) =>
      (result = ruleMatcher(rule)
        ? { index, rules }
        : findIndexAndRules(ruleChildren(rule), ruleMatcher))
  );
  return result;
};

const findRule = (rulesSource, ruleMatcher) => {
  const { index, rules } = findIndexAndRules(rulesSource, ruleMatcher);
  return rules[index];
};

const cssRuleMatcher = rule =>
  rule.test && String(rule.test) === String(/\.css$/);

const createLoaderMatcher = loader => rule =>
  rule.loader && rule.loader.indexOf(`${path.sep}${loader}${path.sep}`) !== -1;
const cssLoaderMatcher = createLoaderMatcher("css-loader");
const postcssLoaderMatcher = createLoaderMatcher("postcss-loader");
const fileLoaderMatcher = createLoaderMatcher("file-loader");

const addAfterRule = (rulesSource, ruleMatcher, value) => {
  const { index, rules } = findIndexAndRules(rulesSource, ruleMatcher);
  rules.splice(index + 1, 0, value);
};

const addBeforeRule = (rulesSource, ruleMatcher, value) => {
  const { index, rules } = findIndexAndRules(rulesSource, ruleMatcher);
  rules.splice(index, 0, value);
};

function createRewireLess(
  localIdentName = `[local]___[hash:base64:5]`,
  lessLoaderOptions = {}
) {
  return function(config, env) {
    const cssRule = findRule(config.module.rules, cssRuleMatcher);
    const lessRule = cloneDeep(cssRule);
    const cssModulesRule = cloneDeep(cssRule);

    cssRule.exclude = /\.module\.css$/;
    cssModulesRule.test = /\.module\.css$/;

    const cssModulesRuleCssLoader = findRule(cssModulesRule, cssLoaderMatcher);
    cssModulesRuleCssLoader.options = Object.assign(
      {
        modules: true,
        localIdentName
      },
      cssModulesRuleCssLoader.options
    );
    addBeforeRule(config.module.rules, fileLoaderMatcher, cssModulesRule);

    lessRule.test = /\.less$/;
    lessRule.exclude = /\.module\.less$/;
    addAfterRule(lessRule, postcssLoaderMatcher, {
      loader: require.resolve("less-loader"),
      options: lessLoaderOptions
    });
    addBeforeRule(config.module.rules, fileLoaderMatcher, lessRule);

    const lessModulesRule = cloneDeep(cssModulesRule);
    lessModulesRule.test = /\.module\.less$/;

    addAfterRule(lessModulesRule, postcssLoaderMatcher, {
      loader: require.resolve("less-loader"),
      options: lessLoaderOptions
    });
    addBeforeRule(config.module.rules, fileLoaderMatcher, lessModulesRule);

    return config;
  };
}

const rewireLess = createRewireLess();

rewireLess.withLoaderOptions = createRewireLess;

module.exports = rewireLess;
