module.exports = {
    getDir(filePathStem) {
        let parts = filePathStem.split('/')
        parts.pop()
        return parts.pop();
    },
    isProductCategory(tags) {
        if (!tags)
            return false;
    
        return tags === 'product-category' || tags.includes('product-category');
    },    
    slugify(target) {
        return target.trim().toLocaleLowercase().replace(' ', '-')
    }
}