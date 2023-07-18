import 'alpine-turbolinks-adapter'
import 'alpinejs'
const turbolinks = require('turbolinks')
// Import local modules
import lazyload from '@modules/lazyload'
import { cartPopup } from '@modules/cart'
import * as helpers from '@utilities/helpers'

window.cartPopup = cartPopup;
window.kUtils = helpers;

function replaceElementWithElement(fromElement, toElement) {
  const parentElement = fromElement.parentElement
  if (parentElement) {
    return parentElement.replaceChild(toElement, fromElement)
  }
}

// turbolinks.SnapshotRenderer.prototype.assignNewBody = function () {
//   const currentBody = window.document.body
//   const newBody = this.newBody

//   const permanentElement = document.querySelector('#snipcart')

//   debugger;
//   newBody.append(permanentElement)

//   replaceElementWithElement(currentBody, newBody)
// }
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

document.addEventListener('snipcart.ready', () => {
  Snipcart.events.on('item.added', needIce);
  Snipcart.events.on('item.removed', needIce);
  Snipcart.events.on('snipcart.initialized', function () {
    const snipcart = document.getElementById('snipcart');
    snipcart.setAttribute('data-turbolinks-permanent', '');
  });
});

async function addIce(iceId) {
  try {
    await Snipcart.api.cart.items.add({
        id: iceId,
        name: 'Dry Ice',
        description: 'Not allowed for sale, only used in shipping',
        image: 'https://res.cloudinary.com/hmillerdev/image/upload/ar_1.3,c_crop/f_auto,q_80/v1625337970/kartchners/logo_q8zfwf.jpg',
        price: 0,
        url: location.origin + '/hidden/dry-ice',
        quantity: 1,
        dimensions: {
          weight: 4536
        },
        customFields: []
    });
  } catch (error) {
      console.log(error)
  }
}

function needIce() {
  const cart = Snipcart.store.getState().cart;
  const iceId = '9999';
  const hasIce = cart.items && cart.items.items.some(item => item.id === iceId);
  if (hasIce) {
    return;
  }

  addIce(iceId);
}