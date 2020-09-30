module.exports = function(id, base) {
    const sizes = [400, 800, 1200, 1600, 2000, 2400];
    
    return sizes.map(size => `${base}/w_${size}/${id} ${size}w`).join(', ');
}