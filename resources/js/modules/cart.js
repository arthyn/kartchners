export const cartPopup = function() {
    return {
        open: false,
        item: {
            name: '',
            quantity: 0,
            price: 0,
            image: ''
        },
        timeout: null,
        init() {
            Snipcart.events.on('item.adding', (cartItem) => this.show(cartItem));
        },
        show(item) {
            debugger;
            clearTimeout(this.timeout);
            this.item = item;
            this.open = true;

            this.timeout = setTimeout(() => {
                this.open = false;
            }, 3000);
        }
    }
}