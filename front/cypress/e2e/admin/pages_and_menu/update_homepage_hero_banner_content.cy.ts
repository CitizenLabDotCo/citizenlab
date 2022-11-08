import { randomEmail, randomString } from '../../../support/commands';

describe('Admin: update Hero Banner content', () => {
  // header content
  const signedOutHeaderEnglish = randomString();
  const signedOutSubheaderEnglish = randomString();
  const updatedSignedOutHeaderEnglish = randomString();
  const updatedSignedOutSubheaderEnglish = randomString();

  // static strings because the buttons can only display a small amount of chars
  const signedOutCTAButton = 'signnnn in!';
  const updatedSignedOutCTAButton = 'pls sign in';
  const updatedSignedOutCTAURL = 'https://wikipedia.org';
  const updatedSignedInCTAButton = 'signedin button!';
  const updatedSignedInCTAURL = 'https://www.example.biz';

  const defaultHomepageSettings = {
    top_info_section_enabled: false,
    bottom_info_section_enabled: false,
    events_widget_enabled: false,
    banner_avatars_enabled: false,
    banner_layout: 'full_width_banner_layout',
    banner_signed_out_header_multiloc: {
      en: signedOutHeaderEnglish,
    },
    banner_signed_out_subheader_multiloc: {
      en: signedOutSubheaderEnglish,
    },
    banner_cta_signed_out_text_multiloc: {
      en: signedOutCTAButton,
    },
    banner_signed_out_header_overlay_color: '#33FFD1',
    banner_signed_out_header_overlay_opacity: 55,
    banner_cta_signed_out_type: 'sign_up_button',
    banner_cta_signed_in_type: 'no_button',
    header_bg:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=',
  };

  beforeEach(() => {
    // set default homepage settings
    cy.apiUpdateHomepageSettings(defaultHomepageSettings);
  });

  // reset settings so we don't interfere with other tests
  afterEach(() => {
    cy.apiUpdateHomepageSettings(defaultHomepageSettings);
  });

  it('displays hero banner settings on the landing page correctly', () => {
    cy.visit('/');
    cy.acceptCookies();

    // main page should be full width layout when logged out
    cy.get('[data-cy=e2e-full-width-layout-header-image-overlay]').should(
      'exist'
    );

    cy.get('#hook-header-content').should('contain', signedOutHeaderEnglish);
    cy.get('#hook-header-content').should('contain', signedOutSubheaderEnglish);

    // avatars should be turned off for now
    cy.get('#hook-header-content')
      .find('[data-testid=avatarBubblesContainer]')
      .should('not.exist');

    // check that the header image color and opacity are displayed correctly
    cy.get('[data-cy=e2e-full-width-layout-header-image-overlay]').should(
      'have.css',
      'background-color',
      'rgb(51, 255, 209)'
    );
    cy.get('[data-cy=e2e-full-width-layout-header-image-overlay]').should(
      'have.css',
      'opacity',
      '0.55'
    );
  });

  it('updates and persists hero banner settings correctly', () => {
    cy.intercept('PATCH', '**/home_page').as('saveHomePage');
    cy.intercept('GET', '**/home_page').as('getHomePage');

    // log in as admin and reload page
    cy.setLoginCookie('admin@citizenlab.co', 'democracy2.0');
    cy.reload();
    cy.acceptCookies();

    // go to page with homepage settings toggles
    cy.visit('/admin/pages-menu/');
    cy.get('[data-testid="edit-button"]').first().click();

    // click hero banner edit button
    cy.get('[data-cy="e2e-admin-edit-button-homepage_banner"]').first().click();

    // click two-column banner layout
    cy.get('[data-cy="e2e-two-column-layout-option"]').click();

    // fill in header and subheader
    cy.get('[data-cy="e2e-signed-out-header-section"]')
      .find('input')
      .clear()
      .type(updatedSignedOutHeaderEnglish);
    cy.get('[data-cy="e2e-signed-out-subheader-section"]')
      .find('input')
      .clear()
      .type(updatedSignedOutSubheaderEnglish);

    // enable avatar display
    cy.get('[data-cy="e2e-banner-avatar-toggle-section"]').find('i').click();

    // enable custom signed out button and fill out text/url
    cy.get('[data-cy="e2e-cta-settings-homepage_signed_out-customized_button"]')
      .find('.circle')
      .click();

    cy.get('[data-cy="e2e-cta-settings-homepage_signed_out-customized_button"]')
      .find('[data-testid=inputMultilocLocaleSwitcher]')
      .find('input')
      .clear()
      .type(updatedSignedOutCTAButton);

    cy.get('[data-cy="e2e-cta-settings-homepage_signed_out-customized_button"]')
      .find('[data-testid=buttonConfigInput]')
      .find('input')
      .clear()
      .type(updatedSignedOutCTAURL);

    // enable custom signed in button and fill out text/url
    cy.get('[data-cy="e2e-cta-settings-homepage_signed_in-customized_button"]')
      .find('.circle')
      .click();

    cy.get('[data-cy="e2e-cta-settings-homepage_signed_in-customized_button"]')
      .find('[data-testid=inputMultilocLocaleSwitcher]')
      .find('input')
      .clear()
      .type(updatedSignedInCTAButton);

    cy.get('[data-cy="e2e-cta-settings-homepage_signed_in-customized_button"]')
      .find('[data-testid=buttonConfigInput]')
      .find('input')
      .clear()
      .type(updatedSignedInCTAURL);

    // save form
    cy.get('.e2e-submit-wrapper-button').click();
    cy.wait('@saveHomePage');
    cy.get('.e2e-submit-wrapper-button').contains('Success');

    // reload page
    cy.reload();
    cy.wait('@getHomePage');

    // check that the data we entered earlier is persisted in the form
    // layout chooser
    cy.get('#banner-two-column-layout').should('have.attr', 'checked');

    // signed-out header and subheader
    cy.get('[data-cy="e2e-signed-out-header-section"]')
      .find('input')
      .should('have.value', updatedSignedOutHeaderEnglish);
    cy.get('[data-cy="e2e-signed-out-subheader-section"]')
      .find('input')
      .should('have.value', updatedSignedOutSubheaderEnglish);

    // avatar display
    cy.get('[data-cy="e2e-banner-avatar-toggle-section"]')
      .find('i')
      .should('have.class', 'enabled');

    // signed out button and url
    cy.get('[data-cy="e2e-cta-settings-homepage_signed_out-customized_button"]')
      .find('[data-testid=inputMultilocLocaleSwitcher]')
      .find('input')
      .should('have.value', updatedSignedOutCTAButton);

    cy.get('[data-cy="e2e-cta-settings-homepage_signed_out-customized_button"]')
      .find('[data-testid=buttonConfigInput]')
      .find('input')
      .should('have.value', updatedSignedOutCTAURL);

    // signed in button and url
    cy.get('[data-cy="e2e-cta-settings-homepage_signed_in-customized_button"]')
      .find('[data-testid=inputMultilocLocaleSwitcher]')
      .find('input')
      .should('have.value', updatedSignedInCTAButton);

    cy.get('[data-cy="e2e-cta-settings-homepage_signed_in-customized_button"]')
      .find('[data-testid=buttonConfigInput]')
      .find('input')
      .should('have.value', updatedSignedInCTAURL);
  });
});
