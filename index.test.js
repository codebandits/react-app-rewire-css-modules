const path = require('path')
const subject = require('./index')

describe('CSS Modules rewire', () => {

    const mockDevelopmentConfig = {
        module: {
            rules: [
                {
                    test: /\.(js|jsx|mjs)$/,
                    enforce: 'pre',
                    use: [
                        {options: {}, loader: path.resolve(__dirname, '/path/to/eslint-loader/index.js')}
                    ],
                    include: path.resolve(__dirname, '/path/to/src')
                },
                {
                    oneOf: [
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: path.resolve(__dirname, '/path/to/url-loader/index.js'),
                            options: {},
                        },
                        {
                            test: /\.(js|jsx|mjs)$/,
                            include: path.resolve(__dirname, '/path/to/src'),
                            loader: path.resolve(__dirname, '/path/to/babel-loader/lib/index.js'),
                            options: {},
                        },
                        {
                            test: /\.css$/,
                            use: [
                                path.resolve(__dirname, '/path/to/style-loader/index.js'),
                                {
                                    loader: path.resolve(__dirname, '/path/to/css-loader/index.js'),
                                    options: {importLoaders: 1},
                                },
                                {
                                    loader: path.resolve(__dirname, '/path/to/postcss-loader/lib/index.js'),
                                    options: {},
                                },
                            ],
                        },
                        {
                            exclude: [/\.js$/, /\.html$/, /\.json$/],
                            loader: path.resolve(__dirname, '/path/to/file-loader/dist/cjs.js'),
                            options: {name: 'static/media/[name].[hash:8].[ext]'},
                        },
                    ]
                }]
        }
    }

    const mockProductionConfig = {
        module: {
            rules: [
                {
                    test: /\.(js|jsx|mjs)$/,
                    enforce: 'pre',
                    use: [
                        {options: {}, loader: path.resolve(__dirname, '/path/to/eslint-loader/index.js')}
                    ],
                    include: path.resolve(__dirname, '/path/to/src')
                },
                {
                    oneOf: [
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: path.resolve(__dirname, '/path/to/url-loader/index.js'),
                            options: {},
                        },
                        {
                            test: /\.(js|jsx|mjs)$/,
                            include: path.resolve(__dirname, '/path/to/src'),
                            loader: path.resolve(__dirname, '/path/to/babel-loader/lib/index.js'),
                            options: {},
                        },
                        {
                            test: /\.css$/,
                            loader: [
                                {
                                    loader: path.resolve(__dirname, '/path/to/extract-text-webpack-plugin/dist/loader.js'),
                                    options: {}
                                },
                                {
                                    loader: path.resolve(__dirname, '/path/to/style-loader/index.js'),
                                    options: {}
                                },
                                {
                                    loader: path.resolve(__dirname, '/path/to/css-loader/index.js'),
                                    options: {
                                        importLoaders: 1,
                                        minimize: true,
                                        sourceMap: true
                                    }
                                },
                                {
                                    loader: path.resolve(__dirname, '/path/to/postcss-loader/lib/index.js'),
                                    options: {}
                                }
                            ]
                        },
                        {
                            exclude: [/\.js$/, /\.html$/, /\.json$/],
                            loader: path.resolve(__dirname, '/path/to/file-loader/dist/cjs.js'),
                            options: {name: 'static/media/[name].[hash:8].[ext]'},
                        },
                    ]
                }]
        }
    }

    describe('CSS loaders', () => {
        describe('development', () => {

            const result = subject(mockDevelopmentConfig)
            const cssLoader = result.module.rules[1].oneOf[2]
            const cssModulesLoader = result.module.rules[1].oneOf[3]

            it('should exclude modules from the regular loader', () => {
                expect(cssLoader.exclude).toEqual(/\.module\.css$/)
            })

            it('should leave the regular loader configuration intact', () => {
                expect(cssLoader.use[1].options).toEqual({
                    importLoaders: 1
                })
            })

            it('should create a modules loader', () => {
                expect(cssModulesLoader.exclude).toBeUndefined()
                expect(cssModulesLoader.use[1].options).toEqual({
                    importLoaders: 1,
                    modules: true,
                    localIdentName: '[local]___[hash:base64:5]'
                })
            })
        })

        describe('production', () => {

            const result = subject(mockProductionConfig)
            const cssLoader = result.module.rules[1].oneOf[2]
            const cssModulesLoader = result.module.rules[1].oneOf[3]

            it('should exclude modules from the regular loader', () => {
                expect(cssLoader.exclude).toEqual(/\.module\.css$/)
            })

            it('should leave the regular loader configuration intact', () => {
                expect(cssLoader.loader[2].options).toEqual({
                    importLoaders: 1,
                    minimize: true,
                    sourceMap: true
                })
            })

            it('should create a modules loader', () => {
                expect(cssModulesLoader.exclude).toBeUndefined()
                expect(cssModulesLoader.loader[2].options).toEqual({
                    importLoaders: 1,
                    minimize: true,
                    sourceMap: true,
                    modules: true,
                    localIdentName: '[local]___[hash:base64:5]'
                })
            })
        })
    })

    describe('SASS loaders', () => {
        describe('development', () => {

            const result = subject(mockDevelopmentConfig)
            const cssLoader = result.module.rules[1].oneOf[2]
            const cssModulesLoader = result.module.rules[1].oneOf[3]
            const sassLoader = result.module.rules[1].oneOf[4]
            const sassModulesLoader = result.module.rules[1].oneOf[5]

            describe('regular loader', () => {
                it('should configure a regular loader', () => {
                    expect(sassLoader.test).toEqual(/\.s[ac]ss$/)
                    expect(sassLoader.exclude).toEqual(/\.module\.s[ac]ss$/)
                })
                it('should build upon the CSS loader', () => {
                    expect(sassLoader.use.slice(0, 3)).toEqual(cssLoader.use)
                })
                it('should append the sass-loader', () => {
                    expect(sassLoader.use[3]).toContain(`${path.sep}sass-loader${path.sep}`)
                })
            })

            describe('modules loader', () => {
                it('should configure a modules loader', () => {
                    expect(sassModulesLoader.test).toEqual(/\.module\.s[ac]ss$/)
                })
                it('should build upon the CSS loader', () => {
                    expect(sassModulesLoader.use.slice(0, 3)).toEqual(cssModulesLoader.use)
                })
                it('should append the sass-loader', () => {
                    expect(sassModulesLoader.use[3]).toContain(`${path.sep}sass-loader${path.sep}`)
                })
            })
        })

        describe('production', () => {
            const result = subject(mockProductionConfig)
            const cssLoader = result.module.rules[1].oneOf[2]
            const cssModulesLoader = result.module.rules[1].oneOf[3]
            const sassLoader = result.module.rules[1].oneOf[4]
            const sassModulesLoader = result.module.rules[1].oneOf[5]

            describe('regular loader', () => {
                it('should configure a regular loader', () => {
                    expect(sassLoader.test).toEqual(/\.s[ac]ss$/)
                    expect(sassLoader.exclude).toEqual(/\.module\.s[ac]ss$/)
                })
                it('should build upon the CSS loader', () => {
                    expect(sassLoader.loader.slice(0, 4)).toEqual(cssLoader.loader)
                })
                it('should append the sass-loader', () => {
                    expect(sassLoader.loader[4]).toContain(`${path.sep}sass-loader${path.sep}`)
                })
            })

            describe('modules loader', () => {
                it('should configure the test regex', () => {
                    expect(sassModulesLoader.test).toEqual(/\.module\.s[ac]ss$/)
                })

                it('should build upon the CSS loader', () => {
                    expect(sassModulesLoader.loader.slice(0, 4)).toEqual(cssModulesLoader.loader)
                })

                it('should append the sass-loader', () => {
                    expect(sassModulesLoader.loader[4]).toContain(`${path.sep}sass-loader${path.sep}`)
                })
            })
        })
    })
})
