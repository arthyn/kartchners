const utils = require('../../utilities');

module.exports = {
    eleventyComputed: {
        category: data => {
            if (data.category)
                return data.category;
                
            return utils.isProductCategory(data.tags) ? utils.getDir(data.page.filePathStem) : null;
        }
    }
};