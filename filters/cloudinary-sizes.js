module.exports = function(id, base) {
    const sizes = [400, 800, 1200, 1600, 2000, 2400];
    let end = id[0] === '/' ? id.slice(1) : id;
    
    return sizes.map(size => `${base}/w_${size}/${end} ${size}w`).join(', ');
}