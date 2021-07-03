const utils = require('../../utilities');

module.exports = {
    default_image: '/v1625337970/kartchners/logo_q8zfwf.jpg',
    eleventyComputed: {
        category: data => {
            if (data.category)
                return data.category;
                
            return utils.isProductCategory(data.tags) ? utils.getDir(data.page.filePathStem) : null;
        }
    }
};