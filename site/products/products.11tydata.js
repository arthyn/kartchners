module.exports = {
    eleventyComputed: {
        tags: data => {
            if (data.tags === 'product-category' || data.tags.includes('product-category'))
                return tags;

            const tags = [...data.tags, 'products'];
            let parts = data.filePathStem.split('/')
            parts.pop()
            let dir = parts.pop();

            if (dir !== 'products')
                tags.push(dir)

            return tags;
        }   
    }
};