import 'alpinejs'
// Import local modules
import lazyload from '@modules/lazyload'
import { cartPopup } from '@modules/cart'
import * as helpers from '@utilities/helpers'

window.cartPopup = cartPopup;
window.kUtils = helpers;

lazyload();

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