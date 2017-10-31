
const ruleChildren = (loader) => loader.use || loader.oneOf || Array.isArray(loader.loader) && loader.loader || []

const findRulesWithMatchingRule = (rulesSource, matcher) => {
    let result = undefined
    const rules = Array.isArray(rulesSource) ? rulesSource : ruleChildren(rulesSource)
    rules.some((rule, index) => result = matcher(rule) ? {index, rules} : findRulesWithMatchingRule(ruleChildren(rule), matcher))
    return result
}

const getRule = (rulesSource, matcher) => {
    const {index, rules} = findRulesWithMatchingRule(rulesSource, matcher)
    return rules[index]
}

const createLoaderMatcher = (loader) => (rule) => rule.loader && rule.loader.indexOf(`/${loader}/`) !== -1
const cssLoaderMatcher = createLoaderMatcher('css-loader')
const postcssLoaderMatcher = createLoaderMatcher('postcss-loader')
const fileLoaderMatcher = createLoaderMatcher('file-loader')
const cssRuleMatcher = (rule) => rule.test && String(rule.test) === String(/\.css$/)

const cloneDeep = require('lodash.clonedeep')

const addAfterLoader = (rulesSource, matcher, value) => {
    const {index, rules} = findRulesWithMatchingRule(rulesSource, matcher)
    rules.splice(index + 1, 0, value)
}

const addBeforeLoader = (rulesSource, matcher, value) => {
    const {index, rules} = findRulesWithMatchingRule(rulesSource, matcher)
    rules.splice(index, 0, value)
}

module.exports = function (config, env) {
    const cssRule = getRule(config.module.rules, cssRuleMatcher)
    const cssRuleCssLoader = getRule(cssRule, cssLoaderMatcher)

    cssRuleCssLoader.options = Object.assign({modules: true, localIdentName: '[local]___[hash:base64:5]'}, cssRuleCssLoader.options)

    const sassRule = cloneDeep(cssRule)
    sassRule.test = /\.s[ac]ss$/
    addAfterLoader(sassRule, postcssLoaderMatcher, require.resolve('sass-loader'))

    addBeforeLoader(config.module.rules, fileLoaderMatcher, sassRule)

    return config
}
