import { randomString } from '../../../support/commands';

describe('Admin: update Hero Banner content', () => {
  it('updates hero banner content and options correctly', () => {
    const signedOutHeaderEnglish = randomString();
    const signedOutSubheaderEnglish = randomString();
    const updatedSignedOutHeaderEnglish = randomString();
    const updatedSignedOutSubheaderEnglish = randomString();

    const signedOutCTAButton = 'signnnn in!';
    const updatedSignedOutCTAButton = 'pls sign in';
    const updatedSignedOutCTAURL = 'https://wikipedia.org';
    const updatedSignedInCTAButton = 'signedin button!';
    const updatedSignedInCTAURL = 'https://www.example.biz';

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
    });

    cy.visit('/');
    cy.acceptCookies();
    cy.wait(1000);

    // main page should be full width layout when logged out
    cy.get('[data-testid="e2e-full-width-banner-layout-container"]').should(
      'exist'
    );

    cy.get('#hook-header-content').should('contain', signedOutHeaderEnglish);
    cy.get('#hook-header-content').should('contain', signedOutSubheaderEnglish);
    // avatars should be turned off for now

    cy.get('#hook-header-content')
      .find('[data-testid=avatarBubblesContainer]')
      .should('not.exist');

    // log in as admin and reload page
    cy.setLoginCookie('admin@citizenlab.co', 'democracy2.0');
    cy.reload();
    cy.acceptCookies();

    // go to page with homepage settings toggles
    cy.visit('/admin/pages-menu/');
    cy.get('[data-testid="edit-button"]').first().click();

    // click hero banner edit button
    cy.get('[data-testid="admin-edit-button-homepage_banner"]').click();

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
    cy.get('[data-testid="e2e-cta-settings-signed_out-customized_button"]')
      .find('.circle')
      .click();

    cy.get('[data-testid="e2e-cta-settings-signed_out-customized_button"]')
      .find('[data-testid=inputMultilocLocaleSwitcher]')
      .find('input')
      .clear()
      .type(updatedSignedOutCTAButton);

    cy.get('[data-testid="e2e-cta-settings-signed_out-customized_button"]')
      .find('[data-testid=buttonConfigInput]')
      .find('input')
      .clear()
      .type(updatedSignedOutCTAURL);

    // enable custom signed in button and fill out text/url
    cy.get('[data-testid="e2e-cta-settings-signed_in-customized_button"]')
      .find('.circle')
      .click();

    cy.get('[data-testid="e2e-cta-settings-signed_in-customized_button"]')
      .find('[data-testid=inputMultilocLocaleSwitcher]')
      .find('input')
      .clear()
      .type(updatedSignedInCTAButton);

    cy.get('[data-testid="e2e-cta-settings-signed_in-customized_button"]')
      .find('[data-testid=buttonConfigInput]')
      .find('input')
      .clear()
      .type(updatedSignedInCTAURL);

    // save form
    cy.get('[data-testid=e2e-hero-banner-save-button]').click();
    cy.get('[data-testid=e2e-hero-banner-save-button]').contains('Success');

    cy.visit('/');

    cy.wait(2000);
  });
});
