module.exports = function(options, basePrice) {
    return options.map(option => {
        const name = option.option_name;
        const price = option.option_price - basePrice;

        if (price < 0) {
            return `${name}[${price}]`
        } else if (price > 0) {
            return `${name}[+${price}]`
        } else {
            return name
        }
    }).join('|')
}