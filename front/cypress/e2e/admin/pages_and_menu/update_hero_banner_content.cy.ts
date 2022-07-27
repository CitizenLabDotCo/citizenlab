import { randomString } from '../../../support/commands';

describe('Admin: update Hero Banner content', () => {
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

  it('displays hero banner settings on the landing page correctly', () => {
    // set default homepage settings
    cy.apiUpdateHomepageSettings({
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
    });

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

  it('updates hero banner settings as admin correctly', () => {
    // log in as admin and reload page
    cy.setLoginCookie('admin@citizenlab.co', 'democracy2.0');
    cy.reload();
    cy.acceptCookies();

    // go to page with homepage settings toggles
    cy.visit('/admin/pages-menu/');
    cy.get('[data-testid="edit-button"]').first().click();

    // click hero banner edit button
    cy.get('[data-cy="e2e-admin-edit-button"]').first().click();

    // click two-column banner layout
    cy.get('[data-testid="e2e-two-column-layout-option"]').click();

    cy.get('[data-testid="e2e-signed-out-header-section"]')
      .find('input')
      .clear()
      .type(updatedSignedOutHeaderEnglish);
    cy.get('[data-testid="e2e-signed-out-subheader-section"]')
      .find('input')
      .clear()
      .type(updatedSignedOutSubheaderEnglish);

    // enable avatar display
    cy.get('[data-testid="e2e-banner-avatar-toggle-section"]')
      .find('i')
      .click();

    // enable custom signed out button and fill out text/url
    cy.get('[data-cy="e2e-cta-settings-signed_out-customized_button"]')
      .find('.circle')
      .click();

    cy.get('[data-cy="e2e-cta-settings-signed_out-customized_button"]')
      .find('[data-testid=inputMultilocLocaleSwitcher]')
      .find('input')
      .clear()
      .type(updatedSignedOutCTAButton);

    cy.get('[data-cy="e2e-cta-settings-signed_out-customized_button"]')
      .find('[data-testid=buttonConfigInput]')
      .find('input')
      .clear()
      .type(updatedSignedOutCTAURL);

    // enable custom signed in button and fill out text/url
    cy.get('[data-cy="e2e-cta-settings-signed_in-customized_button"]')
      .find('.circle')
      .click();

    cy.get('[data-cy="e2e-cta-settings-signed_in-customized_button"]')
      .find('[data-testid=inputMultilocLocaleSwitcher]')
      .find('input')
      .clear()
      .type(updatedSignedInCTAButton);

    cy.get('[data-cy="e2e-cta-settings-signed_in-customized_button"]')
      .find('[data-testid=buttonConfigInput]')
      .find('input')
      .clear()
      .type(updatedSignedInCTAURL);

    // save form
    cy.get('.e2e-submit-wrapper-button').click();
    cy.get('.e2e-submit-wrapper-button').contains('Success');

    cy.visit('/');

    // check content and url for signed in CTA button
    cy.get('[data-cy="e2e-cta-banner-button"]')
      .find('a')
      .contains(updatedSignedInCTAButton);
    cy.get('[data-cy="e2e-cta-banner-button"]')
      .find('a')
      .should('have.attr', 'href', updatedSignedInCTAURL);
  });

  it('views updated settings as logged-out user successfully', () => {
    // logout and reload as signed out user
    cy.logout();
    cy.reload();

    cy.get('[data-testid=e2e-two-column-layout-container]').should('exist');

    // check that the content we saved earlier is shown here
    cy.get('#hook-header-content').should(
      'contain',
      updatedSignedOutHeaderEnglish
    );
    cy.get('#hook-header-content').should(
      'contain',
      updatedSignedOutSubheaderEnglish
    );

    // avatars should be turned on no
    cy.get('#hook-header-content')
      .find('[data-testid=avatarBubblesContainer]')
      .should('exist');

    cy.get('#hook-header-content')
      .find('a')
      .contains(updatedSignedOutCTAButton);
    cy.get('#hook-header-content')
      .find('a')
      .should('have.attr', 'href', updatedSignedOutCTAURL);
  });
});
