const assetManifest = require('../../mix-manifest.json');

module.exports = {

    // environment helper
    'environment': process.env.ELEVENTY_ENV,
    'domain': process.env.CONTEXT === 'production' ? process.env.URL : process.env.DEPLOY_PRIME_URL,
    'prodJS': assetManifest["/js/main.js"],
    'prodCSS': assetManifest["/css/main.css"]
};