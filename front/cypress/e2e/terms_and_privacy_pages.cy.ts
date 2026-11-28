import { randomString } from '../support/commands';

// Policy pages exist once per platform, so each suite edits the existing page and puts it back.
['terms-and-conditions', 'privacy-policy'].forEach((slug) => {
  describe(`The ${slug} page`, () => {
    const title = randomString();
    const body = randomString();
    let pageId: string;
    let originalAttributes: Record<string, unknown>;
    let fileId: string | undefined;

    before(() => {
      cy.apiGetCustomPageBySlug(slug).then((response) => {
        pageId = response.body.data.id;
        const {
          title_multiloc,
          top_info_section_multiloc,
          banner_enabled,
          banner_layout,
          files_section_enabled,
        } = response.body.data.attributes;
        originalAttributes = {
          title_multiloc,
          top_info_section_multiloc,
          banner_enabled,
          banner_layout,
          files_section_enabled,
        };

        // Banner on and files section off: the view ignores both.
        cy.apiUpdateCustomPage(pageId, {
          title_multiloc: { en: title },
          top_info_section_multiloc: { en: `<p>${body}</p>` },
          banner_enabled: true,
          banner_layout: 'full_width_banner_layout',
          files_section_enabled: false,
        });
        cy.apiAddFileToCustomPage(pageId, 'example.pdf', 'example.pdf').then(
          (fileResponse) => {
            fileId = fileResponse.body.data.id;
          }
        );
      });
    });

    after(() => {
      if (fileId) cy.apiRemoveFileFromCustomPage(pageId, fileId);
      if (pageId) cy.apiUpdateCustomPage(pageId, originalAttributes);
    });

    it('shows the title, body and attachments, and no banner', () => {
      cy.visit(`/pages/${slug}`);

      cy.get(`.e2e-page-${slug}`).within(() => {
        cy.get('h1').should('have.text', title);
        cy.contains(body);
        cy.contains('example.pdf');
        cy.get('.e2e-signed-out-header').should('not.exist');
      });
    });

    it("opens this page's editor in Settings → Policies from the edit button", () => {
      cy.setAdminLoginCookie();
      cy.visit(`/pages/${slug}`);

      cy.get(`.e2e-page-${slug}`).contains('Edit page').click();

      cy.location('pathname').should('contain', '/admin/settings/policies');
      cy.get(`.editor-${slug} form`).should('be.visible');
    });
  });
});
