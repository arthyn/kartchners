
let mix = require('laravel-mix')
const path = require('path')
const tailwindcss = require('tailwindcss')

// Paths
const paths = {
    sass: {
        source: './resources/sass/main.scss',
        dest: 'css/'
    },
    javascript: {
        source: './resources/js/main.js',
        singles: './resources/js/singles/*',
        dest: 'js/'
    }
}

// Run mix
mix
    .setPublicPath('./')
    .webpackConfig({
        resolve: {
            alias: {
                '@utilities': path.resolve(__dirname, 'resources/js/utilities'),
                '@modules': path.resolve(__dirname, 'resources/js/modules')
            }
        }
    })
    // Concatenate & Compile Javascript
    .js(paths.javascript.source, paths.javascript.dest)
    // Compile singles
    // .js(paths.javascript.singles, paths.javascript.dest)
    // Compile SCSS & TailwindCSS
    .sass(paths.sass.source, paths.sass.dest)
    // .minify(paths.sass.dest + 'main.css')
    // .minify(paths.javascript.dest + 'main.js')
    .version()
    .options({
        processCssUrls: false,
        postCss: [tailwindcss('./tailwind.config.js')],
    })
