const path = require('path');
const cloneDeep = require('lodash.clonedeep');

const ruleChildren = (loader) => loader.use || loader.oneOf || (Array.isArray(loader.loader) && loader.loader) || [];

const findIndexAndRules = (rulesSource, ruleMatcher) => {
	let result = undefined;
	const rules = Array.isArray(rulesSource) ? rulesSource : ruleChildren(rulesSource);
	rules.some(
		(rule, index) =>
			(result = ruleMatcher(rule) ? { index, rules } : findIndexAndRules(ruleChildren(rule), ruleMatcher))
	);
	return result;
};

const findRule = (rulesSource, ruleMatcher) => {
	const result = findIndexAndRules(rulesSource, ruleMatcher);
	if (result) {
		const { index, rules } = result;
		return rules[index];
	}
	return result;
};

const cssRuleMatcher = (rule) => rule.test && String(rule.test) === String(/\.css$/);
const lessRuleMatcher = (rule) => rule.test && String(rule.test) === String(/\.less$/);

const createLoaderMatcher = (loader) => (rule) =>
	rule.loader && rule.loader.indexOf(`${path.sep}${loader}${path.sep}`) !== -1;
const cssLoaderMatcher = createLoaderMatcher('css-loader');
const lessLoaderMatcher = createLoaderMatcher('less-loader');
const postcssLoaderMatcher = createLoaderMatcher('postcss-loader');
const fileLoaderMatcher = createLoaderMatcher('file-loader');

const addAfterRule = (rulesSource, ruleMatcher, value) => {
	const { index, rules } = findIndexAndRules(rulesSource, ruleMatcher);
	rules.splice(index + 1, 0, value);
};

const addBeforeRule = (rulesSource, ruleMatcher, value) => {
	const { index, rules } = findIndexAndRules(rulesSource, ruleMatcher);
	rules.splice(index, 0, value);
};

const insertRule = (rulesSource, value) => {
	const loaders = rulesSource.find((rule) => Array.isArray(rule.oneOf)).oneOf;
	// Insert less-loader as the penultimate item of loaders (before file-loader)
	loaders.splice(loaders.length - 1, 0, value);
};

function createCssModule(loaderOptions = { css: {}, sass: {}, less: {} }) {
	return function(config, env) {
		const cssRule = findRule(config.module.rules, cssRuleMatcher);
		const sassRule = cloneDeep(cssRule);
		const existLessRule = findRule(config.module.rules, lessRuleMatcher);
		const lessRule = cloneDeep(existLessRule || cssRule);
		const cssModulesRule = cloneDeep(cssRule);

		cssRule.exclude = /\.module\.css$/;

		const cssModulesRuleCssLoader = findRule(cssModulesRule, cssLoaderMatcher);
		cssModulesRuleCssLoader.options = Object.assign(
			{ modules: true, localIdentName: '[local]___[hash:base64:5]' },
			cssModulesRuleCssLoader.options,
			loaderOptions.css
		);
		addBeforeRule(config.module.rules, fileLoaderMatcher, cssModulesRule);

		sassRule.test = /\.s[ac]ss$/;
		sassRule.exclude = /\.module\.s[ac]ss$/;
		addAfterRule(sassRule, postcssLoaderMatcher, require.resolve('less-loader'));
		addBeforeRule(config.module.rules, fileLoaderMatcher, sassRule);

		const sassModulesRule = cloneDeep(cssModulesRule);
		sassModulesRule.test = /\.module\.s[ac]ss$/;
		addAfterRule(sassModulesRule, postcssLoaderMatcher, require.resolve('less-loader'));
		addBeforeRule(config.module.rules, fileLoaderMatcher, sassModulesRule);

		let lessRuleLessLoader = findRule(lessRule, lessLoaderMatcher);
		if (lessRuleLessLoader) {
			lessRuleLessLoader.options = Object.assign(
				{ javascriptEnabled: true },
				lessRuleLessLoader.options,
				loaderOptions.less
			);
		} else {
			lessRuleLessLoader = {
				loader: require.resolve('less-loader'),
				options: Object.assign({ javascriptEnabled: true }, loaderOptions.less)
			};
		}

		lessRule.test = /\.less$/;
		lessRule.exclude = /\.module\.less$/;
		lessRule.sideEffects = true;
		insertRule(config.module.rules, lessRule);
		addAfterRule(lessRule, postcssLoaderMatcher, lessRuleLessLoader);
		addBeforeRule(config.module.rules, fileLoaderMatcher, lessRule);

		const lessModulesRule = cloneDeep(cssModulesRule);
		const lessModulesRuleCssLoader = findRule(lessModulesRule, cssLoaderMatcher);
		lessModulesRuleCssLoader.options = Object.assign({ importLoaders: 2 }, lessModulesRuleCssLoader.options);
		lessModulesRule.test = /\.module\.less$/;

		insertRule(config.module.rules, lessModulesRule);
		addAfterRule(lessModulesRule, postcssLoaderMatcher, lessRuleLessLoader);
		addBeforeRule(config.module.rules, fileLoaderMatcher, lessModulesRule);

		return config;
	};
}

const cssModule = createCssModule();
cssModule.withLoaderOptions = createCssModule;
module.exports = cssModule;
