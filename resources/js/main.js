import 'alpine-turbolinks-adapter'
import 'alpinejs'
const turbolinks = require('turbolinks')
// Import local modules
import '@modules/mobile-nav'
import lazyload from '@modules/lazyload'

turbolinks.start()

let observer;

document.addEventListener("turbolinks:load", function() {
    observer = lazyload()
})

document.addEventListener("turbolinks:before-visit", function() {
    observer.unload()
    observer = null;
})