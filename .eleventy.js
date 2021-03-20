const htmlmin = require("html-minifier")
const utils = require('./utilities')
const klawSync = require('klaw-sync')
const multimatch = require('multimatch')
const casing = require('change-case')

module.exports = eleventyConfig => {

    // Add a readable date formatter filter to Nunjucks
    eleventyConfig.addFilter("dateDisplay", require("./filters/dates.js"))

    // Add a HTML timestamp formatter filter to Nunjucks
    eleventyConfig.addFilter("htmlDateDisplay", require("./filters/timestamp.js"))

    eleventyConfig.addFilter("sizes", require("./filters/cloudinary-sizes.js"))
    eleventyConfig.addFilter("keys", require("./filters/keys.js"))
    eleventyConfig.addFilter("variants", require("./filters/product-variant.js"))

    Object.keys(casing).forEach(key => {
        eleventyConfig.addFilter(key, casing[key])
    })

    eleventyConfig.addShortcode("productList", (products) => {
        return products.reduce((html, product) => {
            return html + `<li class="flex">
                <strong class="flex-1">${product.name}</strong>
                <span>${product.price}</span>
            </li>`;
        }, '')
    })

    // Minify our HTML
    eleventyConfig.addTransform("htmlmin", (content, outputPath) => {
        if ( outputPath.endsWith(".html") )
        {
            let minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true
            })
            return minified
        }
        return content
    })

    // Collections
    eleventyConfig.addCollection('blog', collection => {

        const blogs = collection.getFilteredByTag('blog')

        for( let i = 0; i < blogs.length; i++ ) {

            const prevPost = blogs[i - 1]
            const nextPost = blogs[i + 1]

            blogs[i].data["prevPost"] = prevPost
            blogs[i].data["nextPost"] = nextPost

        }

        return blogs.reverse()

    })
 
    const paths = klawSync('./site')
                    .filter(item => !item.stats.isDirectory())
                    .map(item => item.path.replace(process.cwd() + '/site/', ''))
    const products = multimatch(paths, ['products/**/*', '!products/**/{index,*11tydata}.*'])
    const categories = new Set()

    for (const product of products) {
        let dir = utils.getDir(product);
        categories.add(dir);
    }

    for (const category of categories) {
        eleventyConfig.addCollection(category, collection => {
            const prefix = `site/products/${category}/`
            const items = collection.getFilteredByGlob([`${prefix}*.md`, `!${prefix}index.md`])
                            .filter(item => !item.inputPath.includes('index.md'));
            return items
        });
    }

    eleventyConfig.addCollection("products", async collection => {
        return collection.getFilteredByGlob('./site/products/**/*.md')
                    .filter(item => !item.inputPath.includes('index.md'))
    })

    // Layout aliases
    eleventyConfig.addLayoutAlias('default', 'layouts/default.njk')
    eleventyConfig.addLayoutAlias('page', 'layouts/page.njk')
    eleventyConfig.addLayoutAlias('productList', 'layouts/productList.njk')
    eleventyConfig.addLayoutAlias('product', 'layouts/product.njk')
    eleventyConfig.addLayoutAlias('post', 'layouts/post.njk')
    eleventyConfig.addLayoutAlias('product-grid', 'layouts/product-grid.njk')

    // Include our static assets
    eleventyConfig.addPassthroughCopy("css")
    eleventyConfig.addPassthroughCopy("js")
    eleventyConfig.addPassthroughCopy("images")
    eleventyConfig.addPassthroughCopy("fonts")
    eleventyConfig.addPassthroughCopy("robots.txt")

    eleventyConfig.setBrowserSyncConfig({
        // scripts in body conflict with Turbolinks
        snippetOptions: {
          rule: {
            match: /<\/head>/i,
            fn: function(snippet, match) {
              return snippet + match;
            }
          }
        }
      });

    return {
        templateFormats: ["md", "njk"],
        markdownTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',
        passthroughFileCopy: true,

        dir: {
            input: 'site',
            output: 'dist',
            includes: 'includes',
            data: 'globals'
        }
    }

}
