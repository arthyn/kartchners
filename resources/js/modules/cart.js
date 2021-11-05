export const cartPopup = function() {
    return {
        open: false,
        item: {
            name: '',
            quantity: 0,
            price: 0,
            image: '',
            customFields: []
        },
        timeout: null,
        init() {
            document.addEventListener('snipcart.ready', () => {
                Snipcart.events.on('item.adding', (cartItem) => {
                    if (cartItem.id !== '9999') {
                        this.show(cartItem)
                    }
                });
            });
        },
        show(item) {
            clearTimeout(this.timeout);
            this.item = item;
            this.open = true;

            this.timeout = setTimeout(() => {
                this.open = false;
            }, 3000);
        },
        getName() {
            const optionField = this.item.customFields[0];

            if (optionField && optionField.value) {
                return this.item.name + ' - ' + optionField.value
            }

            return this.item.name
        }
    }
}