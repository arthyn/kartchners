import { exists } from '@utilities/helpers'

function preloadImage(img) {
    const srcset = img.dataset.srcset
    const src = img.dataset.lazy

    img.src = src
    if (srcset)
        img.srcset = srcset

    img.classList.add('loaded')
}

// options
const options = {
    threshold: 0.2
}

const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            preloadImage(entry.target)
            obs.unobserve(entry.target)
        }
    })
}, options)

function Lazyload(lazyObserver) {
    const obs = lazyObserver || observer;
    const images = document.querySelectorAll('[data-lazy]')

    if ( !exists(images) )
        return {
            unload() {}
        }

    images.forEach(image => {
        obs.observe(image)
    })

    return obs;
}

export default Lazyload
