import $$ from '@utilities/selectors'

/**
 * @description Test if the body id is something
 * @param  		{string}
 * @return 		{bool}
 *
 */

const page = function(name) {

    if (!name) {
        return $$.body.getAttribute('id')
    }

    return ($$.body.getAttribute('id') == name)

}


/**
 * @description Check if element exists the page
 * @param  		{string} Element selector
 * @param  		{string} Minimum number of elements
 * @return 		{bool}
 */

const exists = function(el, limit) {

    return (el.length > 0)

}

const extractCloudinaryParts = (url) => {
    const pattern = /^(.*\/image\/upload\/)(.*\/)(v\d+.*)$/
    const matches = pattern.exec(url);
    if (!matches)
        return null;

    return {
        prefix: matches[1],
        formatting: matches[2],
        path: matches[3]
    }
}

export {
    page,
    exists,
    extractCloudinaryParts
}


