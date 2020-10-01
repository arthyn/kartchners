import $$ from '@utilities/selectors'

const MobileNav = function MobileNav()
{

    $$.mobileNavToggle.addEventListener('click', function() {

        this.classList.toggle('menu-toggle-active')
        $$.mobileNav.classList.toggle('menu-visible')

        // set aria-expanded attribute on menu toggle button
        if ( this.getAttribute('aria-expanded') === 'false' )
        {

            this.setAttribute('aria-expanded', 'true')

        } else {

            this.setAttribute('aria-expanded', 'false')

        }

    })

    window.addEventListener('hashchange', function() {
        $$.mobileNavToggle.classList.remove('menu-toggle-active');
        $$.mobileNav.classList.remove('menu-visible')
        $$.mobileNavToggle.setAttribute('aria-expanded', 'false')
    });

}()

export default MobileNav
