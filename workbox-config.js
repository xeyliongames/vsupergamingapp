module.exports = {
    globDirectory: "www/",
    globPatterns: [
        "**/*.{js,html,css,eot,svg,ttf,woff,ico,png,jpg,json,md,jst,py,gemspec,rb,in,license,txt,yml,scss,erb,sh}"
    ],
    globIgnores: [
        "node_modules/**/*",
        "sw.js"
    ],
    dontCacheBustURLsMatching: new RegExp('.+\.[a-f0-9]{20}\..+'),
    maximumFileSizeToCacheInBytes: 5000000,
    swDest: "www/sw.js",
    runtimeCaching: [
    ]
}