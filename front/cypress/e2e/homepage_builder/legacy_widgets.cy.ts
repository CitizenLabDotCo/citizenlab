const homepageMinimalData = {
  ROOT: {
    type: 'div',
    isCanvas: true,
    props: { id: 'e2e-content-builder-frame' },
    displayName: 'div',
    custom: {},
    hidden: false,
    nodes: ['j_8F37ESLH', 'RUeJQobA8i'],
    linkedNodes: {},
  },
  RUeJQobA8i: {
    type: { resolvedName: 'Projects' },
    isCanvas: false,
    props: { currentlyWorkingOnText: { en: '' } },
    displayName: 'Projects',
    custom: {
      title: {
        id: 'app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.CraftComponents.Projects.projectsTitle',
        defaultMessage: 'Projects',
      },
      noPointerEvents: true,
    },
    parent: 'ROOT',
    hidden: false,
    nodes: [],
    linkedNodes: {},
  },
  j_8F37ESLH: {
    type: { resolvedName: 'HomepageBanner' },
    isCanvas: false,
    props: {
      homepageSettings: {
        banner_layout: 'full_width_banner_layout',
        banner_avatars_enabled: true,
        banner_cta_signed_in_url: 'https://www.google.com',
        banner_cta_signed_in_type: 'no_button',
        banner_cta_signed_out_url: '',
        banner_cta_signed_out_type: 'sign_up_button',
        banner_signed_in_header_multiloc: { en: '' },
        banner_signed_out_header_multiloc: { en: '' },
        banner_cta_signed_in_text_multiloc: { en: '' },
        banner_cta_signed_out_text_multiloc: { en: '' },
        banner_signed_out_subheader_multiloc: { en: '' },
        banner_signed_in_header_overlay_color: '#0A5159',
        banner_signed_out_header_overlay_color: '#0A5159',
        banner_signed_in_header_overlay_opacity: 90,
        banner_signed_out_header_overlay_opacity: 90,
      },
      image: {},
      errors: [],
      hasError: false,
    },
    displayName: 'HomepageBanner',
    custom: {
      title: {
        id: 'app.containers.admin.ContentBuilder.homepage.homepageBanner',
        defaultMessage: 'Homepage banner',
      },
      noPointerEvents: true,
    },
    parent: 'ROOT',
    hidden: false,
    nodes: [],
    linkedNodes: {},
  },
};

describe('Homepage builder', () => {
  after(() => {
    cy.setAdminLoginCookie();
    cy.apiUpdateHomepageLayout({
      craftjs_json: homepageMinimalData,
    });
  });

  it.skip('updates and delete homepage builder content correctly', () => {
    cy.setAdminLoginCookie();
    cy.apiUpdateHomepageLayout({
      craftjs_json: homepageMinimalData,
    });
    cy.intercept(
      'POST',
      '**/home_pages/content_builder_layouts/homepage/upsert'
    ).as('saveHomePage');
    cy.intercept('GET', '**/home_pages/content_builder_layouts/homepage').as(
      'getHomePage'
    );
    cy.intercept('GET', '**/pages-menu').as('getPages');
    cy.intercept('GET', '**/nav_bar_items').as('getNavbarItems');
    cy.intercept('GET', '**/admin_publications**').as('getAdminPublications');
    cy.intercept('GET', '**/events**').as('getEvents');
    // go to admin page
    cy.visit('/admin/pages-menu/');

    cy.wait('@getPages');
    cy.wait('@getNavbarItems');
    // go to page with homepage builder
    cy.dataCy('e2e-navbar-item-edit-button').first().click();

    cy.wait('@getHomePage');
    cy.wait(1000);

    cy.get('#e2e-draggable-two-column').dragAndDrop('.e2e-signed-out-header', {
      position: 'below',
    });

    // Components added to all columns
    cy.get('#e2e-draggable-text-multiloc').dragAndDrop(
      'div.e2e-single-column',
      {
        position: 'inside',
      }
    );

    cy.get('div.e2e-text-box').should('have.length', 2);
    cy.get('div.e2e-text-box').first().click();
    cy.get('.ql-editor').type('first text');
    cy.get('div.e2e-text-box').last().click();
    cy.get('.ql-editor').type('last text');

    // Events
    cy.get('#e2e-draggable-events').dragAndDrop('.e2e-signed-out-header', {
      position: 'below',
    });

    // Customize projects title
    cy.dataCy('e2e-projects').click({
      force: true,
    });
    cy.get('#project_title').type('Custom projects title');

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveHomePage');

    cy.visit(`/`);
    cy.wait(2000);
    cy.wait('@getHomePage');
    cy.wait('@getAdminPublications');
    cy.get('.e2e-two-column').should('exist');
    cy.get('div.e2e-text-box').should('have.length', 2);
    cy.get('div.e2e-text-box').first().should('contain', 'first text');
    cy.get('div.e2e-text-box').last().should('contain', 'last text');
    cy.wait('@getEvents');
    cy.dataCy('e2e-events').should('exist');
    cy.dataCy('e2e-projects').should('contain', 'Custom projects title');

    cy.setAdminLoginCookie();

    // go to admin page
    cy.visit('/admin/pages-menu/');

    cy.wait('@getPages');

    cy.wait('@getNavbarItems');
    // go to page with homepage builder
    cy.dataCy('e2e-navbar-item-edit-button').first().click();

    cy.wait('@getHomePage');
    cy.wait(1000);

    cy.get('.e2e-two-column').should('exist');

    // Delete two column
    cy.get('.e2e-two-column').click({
      force: true,
    });
    cy.get('#e2e-delete-button').click();

    // Delete events
    cy.wait('@getEvents');
    cy.dataCy('e2e-events').should('exist');
    cy.dataCy('e2e-events').click({
      force: true,
    });
    cy.get('#e2e-delete-button').click();

    // Clear projects title
    cy.dataCy('e2e-projects').click({
      force: true,
    });

    // Projects are not deletable
    cy.get('#e2e-delete-button').should('not.exist');
    cy.get('#project_title').clear();

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveHomePage');
    cy.visit(`/`);
    cy.wait(2000);
    cy.wait('@getHomePage');
    cy.get('.e2e-two-column').should('not.exist');
    cy.get('div.e2e-text-box').should('not.exist');
    cy.dataCy('e2e-events').should('not.exist');

    cy.wait('@getAdminPublications');
    const regex = /currently working on/gi;
    cy.dataCy('e2e-projects').should(($el) => {
      const text = $el.text();
      expect(text).to.match(regex);
    });
  });

  it.skip('updates homepage banner correctly', () => {
    cy.setAdminLoginCookie();
    cy.apiUpdateHomepageLayout({
      craftjs_json: homepageMinimalData,
    });
    cy.logout();
    cy.intercept(
      'POST',
      '**/home_pages/content_builder_layouts/homepage/upsert'
    ).as('saveHomePage');
    cy.intercept('GET', '**/home_pages/content_builder_layouts/homepage').as(
      'getHomePage'
    );
    cy.intercept('GET', '**/app_configuration').as('getAppConfiguration');
    cy.intercept('GET', '**/pages-menu').as('getPages');
    cy.intercept('GET', '**/nav_bar_items').as('getNavbarItems');
    cy.intercept('POST', '**/content_builder_layout_images').as('postImage');
    cy.intercept('GET', '**/admin_publications**').as('getAdminPublications');

    // Check homepage banner defaults signed - out

    cy.visit('/');
    cy.wait(2000);
    cy.wait('@getAppConfiguration');
    cy.wait('@getHomePage');
    cy.dataCy('e2e-homepage-banner').should('exist');
    cy.dataCy('e2e-full-width-banner-layout-container').should('exist');

    const signedOutHeaderEnglish = /Let’s shape the future of/gi;
    const signedOutSubheaderEnglish =
      /Welcome to the participation platform of/gi;

    cy.get('#hook-header-content').should(($el) => {
      const text = $el.text();
      expect(text).to.match(signedOutHeaderEnglish);
    });

    cy.get('#hook-header-content').should(($el) => {
      const text = $el.text();
      expect(text).to.match(signedOutSubheaderEnglish);
    });

    cy.get('#hook-header-content')
      .find('[data-testid=avatarBubblesContainer]')
      .should('exist');

    cy.dataCy('e2e-full-width-layout-header-image-overlay').should('exist');
    cy.dataCy('e2e-full-width-layout-header-image-overlay').should(
      'have.css',
      'background-color',
      'rgb(10, 81, 89)'
    );
    cy.dataCy('e2e-full-width-layout-header-image-overlay').should(
      'have.css',
      'opacity',
      '0.9'
    );

    cy.get('.buttonText').should('contain', 'Sign up');

    // Check homepage banner defaults signed - in

    cy.setAdminLoginCookie();

    cy.visit('/');
    cy.wait(2000);
    cy.wait('@getHomePage');
    cy.wait('@getAdminPublications');
    cy.wait('@getAppConfiguration');
    cy.get('.e2e-signed-in-header').should('exist');

    cy.dataCy('e2e-signed-in-header-image-overlay').should(
      'have.css',
      'background-color',
      'rgb(10, 81, 89)'
    );
    cy.dataCy('e2e-signed-in-header-image-overlay').should(
      'have.css',
      'opacity',
      '0.9'
    );

    cy.dataCy('e2e-signed-in-header-image').should('not.exist');

    // Go to admin page

    cy.visit('/admin/pages-menu/homepage-builder');

    cy.wait('@getHomePage');
    cy.wait('@getNavbarItems');
    cy.wait(6000);

    // Update homepage banner

    cy.dataCy('e2e-homepage-banner').click({
      force: true,
    });

    // Homepage bannner is not deletable
    cy.get('#e2e-delete-button').should('not.exist');

    // Update image
    cy.get('#bannerImage').attachFile('testimage.png');
    cy.wait('@postImage');
    cy.wait(1000);

    // Update avatar bubbles
    cy.dataCy('e2e-banner-avatar-toggle').find('i').click();

    // Update header and subheader
    cy.dataCy('e2e-signed-out-header-section')
      .find('input')
      .clear()
      .type('New header');
    cy.dataCy('e2e-signed-out-subheader-section')
      .find('input')
      .clear()
      .type('New subheader');

    // Update custom button

    cy.get('#cta-type-customized_button').click({
      force: true,
    });
    cy.get('#customizedButtonText').clear().type('Custom button');
    cy.get('#customizedButtonUrl').clear().type('https://www.google.com');

    // Signed - in header

    cy.get('#e2e-signed-in-button').click({
      force: true,
    });

    // Update header
    cy.dataCy('e2e-signed-in-header-section')
      .find('input')
      .clear()
      .type('New header');

    cy.get('#cta-type-customized_button').click({
      force: true,
    });
    cy.get('#customizedButtonText').clear().type('Custom button');
    cy.get('#customizedButtonUrl').clear().type('https://www.google.com');

    cy.dataCy('e2e-signed-in-header-image').should('exist');
    cy.get('.buttonText').should('contain', 'Custom button');
    cy.dataCy('e2e-homepage-banner').should('contain', 'New header');

    // Save homepage
    cy.get('#e2e-content-builder-topbar-save').click({
      force: true,
    });
    cy.wait('@saveHomePage');
    cy.wait(1000);

    // Check updated content signed - out
    cy.logout();
    cy.visit('/');
    cy.wait(2000);
    cy.wait('@getAppConfiguration');
    cy.wait('@getHomePage');
    cy.wait('@getAdminPublications');
    cy.dataCy('e2e-homepage-banner').should('exist');
    cy.dataCy('e2e-full-width-banner-layout-container').should('exist');

    cy.dataCy('e2e-full-width-banner-layout-header-image')
      .should('have.css', 'background-image')
      .and('include', '.png');

    cy.get('#hook-header-content')
      .find('[data-testid=avatarBubblesContainer]')
      .should('not.exist');

    cy.get('#hook-header-content').should('contain', 'New header');
    cy.get('#hook-header-content').should('contain', 'New subheader');

    cy.get('.buttonText').should('contain', 'Custom button');
  });

  it.skip('updates homepage banner layout correctly fixed ratio', () => {
    cy.intercept(
      'POST',
      '**/home_pages/content_builder_layouts/homepage/upsert'
    ).as('saveHomePage');
    cy.intercept('POST', '**/content_builder_layout_images').as('postImage');
    cy.intercept('GET', '**/home_pages/content_builder_layouts/homepage').as(
      'getHomePage'
    );
    cy.intercept('GET', '**/app_configuration').as('getAppConfiguration');
    cy.intercept('GET', '**/admin_publications**').as('getAdminPublications');

    // Fixed ratio layout
    cy.setAdminLoginCookie();
    cy.visit('/admin/pages-menu/homepage-builder');

    cy.wait('@getHomePage');
    cy.wait(1000);
    cy.dataCy('e2e-homepage-banner').click({
      force: true,
    });
    cy.dataCy('e2e-fixed-ratio-layout-option').click();
    cy.wait(1000);
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveHomePage');

    cy.logout();
    cy.visit('/');
    cy.wait(2000);
    cy.wait('@getHomePage');
    cy.wait('@getAppConfiguration');
    cy.wait('@getAdminPublications');
    cy.dataCy('e2e-homepage-banner').should('exist');
    cy.dataCy('e2e-fixed-ratio-layout-container').should('exist');
  });

  it.skip('updates homepage banner layout correctly two row', () => {
    cy.intercept(
      'POST',
      '**/home_pages/content_builder_layouts/homepage/upsert'
    ).as('saveHomePage');
    cy.intercept('POST', '**/content_builder_layout_images').as('postImage');
    cy.intercept('GET', '**/home_pages/content_builder_layouts/homepage').as(
      'getHomePage'
    );
    cy.intercept('GET', '**/app_configuration').as('getAppConfiguration');
    cy.intercept('GET', '**/admin_publications**').as('getAdminPublications');

    // Two row layout
    cy.setAdminLoginCookie();
    cy.visit('/admin/pages-menu/homepage-builder');

    cy.wait('@getHomePage');
    cy.wait(1000);

    cy.dataCy('e2e-homepage-banner').click({
      force: true,
    });
    cy.dataCy('e2e-two-row-layout-option').click();
    cy.wait(1000);
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveHomePage');
    cy.logout();
    cy.visit('/');
    cy.wait(2000);
    cy.wait('@getHomePage');
    cy.wait('@getAppConfiguration');
    cy.wait('@getAdminPublications');
    cy.dataCy('e2e-homepage-banner').should('exist');
    cy.dataCy('e2e-two-row-layout-container').should('exist');
  });
});
