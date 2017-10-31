
const ruleChildren = (loader) => loader.use || loader.oneOf || Array.isArray(loader.loader) && loader.loader || []

const getRule = (rulesSource, matcher) => {
    let matchingRule = undefined
    const rules = Array.isArray(rulesSource) ? rulesSource : ruleChildren(rulesSource)
    rules.some(rule => matchingRule = matcher(rule) ? rule : getRule(ruleChildren(rule), matcher))
    return matchingRule
}

const createLoaderMatcher = (loader) => (rule) => rule.loader && rule.loader.indexOf(`/${loader}/`) !== -1
const cssLoaderMatcher = createLoaderMatcher('css-loader')
const cssRuleMatcher = (rule) => rule.test && String(rule.test) === String(/\.css$/)

module.exports = function (config, env) {
    const cssRule = getRule(config.module.rules, cssRuleMatcher)
    const cssRuleCssLoader = getRule(cssRule, cssLoaderMatcher)

    cssRuleCssLoader.options = Object.assign({modules: true, localIdentName: '[local]___[hash:base64:5]'}, cssRuleCssLoader.options)

    return config
}
