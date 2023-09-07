const utils = require('../../utilities');

module.exports = {
    default_image: '/logo_2_ft5ef3_i2nr6z',
    eleventyComputed: {
        category: data => {
            if (data.category)
                return data.category;
                
            return utils.isProductCategory(data.tags) ? utils.getDir(data.page.filePathStem) : null;
        }
    }
};