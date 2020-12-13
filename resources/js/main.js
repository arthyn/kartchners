import 'alpine-turbolinks-adapter'
import 'alpinejs'
const turbolinks = require('turbolinks')
// Import local modules
import lazyload from '@modules/lazyload'
import { cartPopup } from '@modules/cart'

window.cartPopup = cartPopup;

turbolinks.start()

let observer;

document.addEventListener('turbolinks:click', function (event) {
    var anchorElement = event.target
    var isSamePageAnchor = (
      anchorElement.hash &&
      anchorElement.origin === window.location.origin &&
      anchorElement.pathname === window.location.pathname
    )
    
    if (isSamePageAnchor) {
      Turbolinks.controller.pushHistoryWithLocationAndRestorationIdentifier(
        event.data.url,
        Turbolinks.uuid()
      )
      event.preventDefault()
    }
  })

document.addEventListener("turbolinks:load", function() {
    observer = lazyload()
    console.log('connecting')
})

document.addEventListener("turbolinks:before-visit", function() {
    if (typeof observer.disconnect === 'function') {
      observer.disconnect()
      console.log('disconnecting')
    }
})