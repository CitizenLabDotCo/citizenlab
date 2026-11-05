import { randomString } from '../../support/commands';
import moment = require('moment');

export const createSurveyProject = (cy: any) => {
  const projectTitle = randomString();
  const phaseTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  return new Promise((res) => {
    cy.setAdminLoginCookie();
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      publicationStatus: 'published',
    })
      .then((project: any) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        return cy.apiCreatePhase({
          projectId: projectId as string,
          title: phaseTitle,
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'native_survey',
          nativeSurveyButtonMultiloc: { en: 'Take the survey' },
          nativeSurveyTitleMultiloc: { en: 'Survey' },
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase: any) => {
        phaseId = phase.body.data.id;
        res({
          projectId,
          projectSlug,
          phaseId,
        });
      });
  });
};

export const waitForCustomFormFields = () => {
  cy.intercept('**/phases/**/custom_fields**').as('customFields');
  cy.wait('@customFields', { timeout: 20000 });
  cy.wait(1000);
};

// Add a toolbox item to the survey's default page with a real mouse drag.
// The keyboard-based addItemToFormBuilder derives its arrow-key step count
// from DOM sibling indexes, which intermittently computes zero steps and
// lifts + drops the item in place — nothing gets added and the field
// settings panel never opens. Dragging to the page's explicit drop zone
// removes that failure mode. A fresh native survey's default page always
// has the key `page1`, which gives the drop zone its stable selector.
//
// The drag itself can still be silently swallowed: a late custom_fields
// refetch re-renders the droppable mid-drag and @hello-pangea/dnd abandons
// the drop (full-suite failure screenshots show the complete mouse sequence
// dispatched with the canvas unchanged). That refetch is one-shot per page
// load, so a re-drag after the canvas settles lands on a stable DOM. The
// retry is bounded so a genuinely broken form builder still fails loudly.
export const addSurveyField = (toolboxSelector: string) => {
  cy.dataCy('e2e-field-row')
    .its('length')
    .then((initialCount) => {
      const attemptDrag = (attemptsLeft: number) => {
        cy.dragToolboxItemTo(
          toolboxSelector,
          '[data-cy="e2e-page-drop-page1"]'
        );
        // Give a slow-but-successful drop time to render its field row —
        // re-dragging after a drop that did register would add a duplicate.
        cy.wait(500);
        cy.dataCy('e2e-field-row').then(($rows) => {
          if ($rows.length === initialCount) {
            expect(
              attemptsLeft,
              'drag attempts before a new field row appeared'
            ).to.be.greaterThan(0);
            attemptDrag(attemptsLeft - 1);
          }
        });
      };
      attemptDrag(4);
    });

  // The newly added field's settings panel opens with an empty title.
  // Asserting emptiness both proves the drop registered and guards against
  // typing into the panel of a previously added field.
  cy.get('#e2e-title-multiloc').should('be.visible').should('have.value', '');
};
