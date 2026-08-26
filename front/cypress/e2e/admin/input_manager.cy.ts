import { randomString, randomEmail } from '../../support/commands';
import moment = require('moment');

function checkSelectedAssigneeFilter(optionLabelText: string) {
  cy.get('#e2e-select-assignee-filter')
    .find(':selected')
    .should('have.text', optionLabelText);
}

function selectAssigneeFilter(optionLabelText: string) {
  cy.get('#e2e-select-assignee-filter').select(optionLabelText);
}

// TEMPORARY diagnostic instrumentation — records what happens to the assignee
// select around `cy.select()`. Remove once the flake is understood.
let probe: Record<string, unknown> = {};
let removals: string[] = [];
let observer: MutationObserver | undefined;
let probedSelect: HTMLSelectElement | undefined;

function describeEl(el: Node | null | undefined): string {
  if (!el) return 'none';
  if (!(el instanceof Element)) return el.nodeName;
  const id = el.id ? `#${el.id}` : '';
  const cls =
    typeof el.className === 'string' && el.className.trim()
      ? `.${el.className.trim().split(/\s+/).join('.')}`
      : '';
  return `${el.tagName.toLowerCase()}${id}${cls}`;
}

function probeAssigneeSelect(rowSelector: string, targetOptionText: string) {
  return cy
    .get(rowSelector)
    .find('#post-row-select-assignee')
    .then(($select) => {
      const el = $select[0] as HTMLSelectElement;
      const doc = el.ownerDocument;
      const win = doc.defaultView;
      if (!win) return;
      const rect = el.getBoundingClientRect();
      const atPoint = doc.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
      const row = el.closest('tr');
      const t0 = win.performance.now();

      probedSelect = el;
      probe = {
        attached: doc.contains(el),
        disabledProp: el.disabled,
        disabledAttr: el.hasAttribute('disabled'),
        rect: `${Math.round(rect.left)},${Math.round(rect.top)} ${Math.round(
          rect.width
        )}x${Math.round(rect.height)}`,
        atPoint: describeEl(atPoint),
        atPointIsSelect: atPoint === el || el.contains(atPoint),
        rowClass: row?.className,
        rowDraggable: row?.getAttribute('draggable'),
        optionCount: el.options.length,
        hasTargetOption: Array.from(el.options).some(
          (o) => o.text.trim() === targetOptionText
        ),
        activeBefore: describeEl(doc.activeElement),
      };

      removals = [];
      observer?.disconnect();
      observer = new win.MutationObserver((records) => {
        records.forEach((record) => {
          record.removedNodes.forEach((node) => {
            if (node === el || node === row || node.contains(el)) {
              removals.push(
                `t+${Math.round(
                  win.performance.now() - t0
                )}ms removed ${describeEl(node)}`
              );
            }
          });
        });
      });
      observer.observe(doc.body, { childList: true, subtree: true });
    });
}

describe('Input manager', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  describe('Assignee filter', () => {
    it('Filters on All ideas', () => {
      cy.visit('/admin/ideas/');
      checkSelectedAssigneeFilter('Any administrator');
      // check that number of ideas on first page is 10
      cy.get('.e2e-idea-manager-idea-row').should('have.length', 10);
    });

    it('Filters on Assigned to me', () => {
      cy.getAdminAuthUser().then((user) => {
        const projectTitle = randomString();
        const projectDescriptionPreview = randomString();
        const projectDescription = randomString();
        const userId = user.body.data.id;
        let projectId: string;
        const phaseTitle = randomString();

        // create project with signed-in admin/user as default assignee
        cy.apiCreateProject({
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: projectDescription,
          publicationStatus: 'published',
          assigneeId: userId,
        })
          .then((project) => {
            projectId = project.body.data.id;
            return cy.apiCreatePhase({
              projectId,
              title: phaseTitle,
              startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
              participationMethod: 'ideation',
              canPost: true,
              canComment: true,
              canReact: true,
              allow_anonymous_participation: true,
            });
          })
          .then((phase) => {
            const ideaTitle = randomString();
            const ideaContent = randomString();

            cy.apiCreateIdea({
              phaseId: phase.body.data.id,
              ideaTitle,
              ideaContent,
            });

            // do a refresh for the new idea to appear
            cy.visit('/admin/ideas/');
            // click on Assigned to me filter
            const optionLabelText = 'Assigned to me';
            selectAssigneeFilter(optionLabelText);
            checkSelectedAssigneeFilter(optionLabelText);
            // Check whether the newly created idea is assigned to the user
            cy.get('.e2e-idea-manager-idea-row').contains(ideaTitle);
          });
      });
    });
  });

  describe('Need feedback toggle', () => {
    it('Filters on ideas that need feedback', () => {
      cy.getAdminAuthUser().then((user) => {
        const projectTitle = randomString();
        const projectDescriptionPreview = randomString();
        const projectDescription = randomString();
        const userId = user.body.data.id;
        let projectId: string;

        // create project with signed-in admin/user as default assignee
        cy.apiCreateProject({
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: projectDescription,
          publicationStatus: 'published',
          assigneeId: userId,
        })
          .then((project) => {
            projectId = project.body.data.id;
            return cy.apiCreatePhase({
              projectId,
              title: 'phaseTitle',
              startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
              participationMethod: 'ideation',
              canPost: true,
              canComment: true,
              canReact: true,
              allow_anonymous_participation: true,
            });
          })
          .then((phase) => {
            const ideaTitle1 = randomString();
            const ideaTitle2 = randomString();
            const ideaContent1 = randomString();
            const ideaContent2 = randomString();

            // Create one idea with official feedback
            cy.apiCreateIdea({
              phaseId: phase.body.data.id,
              ideaTitle: ideaTitle1,
              ideaContent: ideaContent1,
            }).then((idea) => {
              const ideaId = idea.body.data.id;
              const officialFeedbackContent = randomString();
              const officialFeedbackAuthor = randomString();
              cy.apiCreateOfficialFeedbackForIdea(
                ideaId,
                officialFeedbackContent,
                officialFeedbackAuthor
              );

              // Create one idea without official feedback
              cy.apiCreateIdea({
                phaseId: phase.body.data.id,
                ideaTitle: ideaTitle2,
                ideaContent: ideaContent2,
              }).then(() => {
                cy.wait(500);
                cy.visit('/admin/ideas/');

                // Select the newly create project as a filter and check if it just shows our two created ideas
                cy.get('.e2e-idea-manager-project-filter-item')
                  .contains(projectTitle)
                  .click();
                cy.get('.e2e-idea-manager-idea-row').should('have.length', 2);

                // Turn the 'need feedback' toggle on and check whether it only shows the idea without official feedback
                cy.get('#e2e-feedback_needed_filter_toggle').click();
                cy.get('.e2e-idea-manager-idea-row').should('have.length', 1);
              });
              cy.wait(500);
            });
          });
      });
    });
  });

  describe('Idea preview ', () => {
    it('Opens when you click an idea title, then closes with X button', () => {
      cy.visit('/admin/ideas/');
      checkSelectedAssigneeFilter('Any administrator');
      // click on title of first idea
      cy.get('.e2e-idea-manager-idea-title')
        .first()
        .click()
        .then((ideaTitle) => {
          // check if the modal popped out and has the idea in it
          cy.get('#e2e-modal-container')
            .find('#e2e-idea-title')
            .contains(ideaTitle.text());
          // close modal
          cy.get('.e2e-modal-close-button').click();
          // check if the modal is no longer on the page
          cy.get('#e2e-modal-container').should('have.length', 0);
        });
    });
    it('Closes when you delete the idea', () => {
      cy.getAdminAuthUser().then((user) => {
        const projectTitle = randomString();
        const projectDescriptionPreview = randomString();
        const projectDescription = randomString();
        const userId = user.body.data.id;
        let projectId: string;

        // create project with signed-in admin/user as default assignee
        cy.apiCreateProject({
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: projectDescription,
          publicationStatus: 'published',
          assigneeId: userId,
        })
          .then((project) => {
            projectId = project.body.data.id;
            return cy.apiCreatePhase({
              projectId,
              title: 'phaseTitle',
              startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
              participationMethod: 'ideation',
              canPost: true,
              canComment: true,
              canReact: true,
              allow_anonymous_participation: true,
            });
          })
          .then((phase) => {
            const ideaTitle = randomString();
            const ideaContent = randomString();

            cy.apiCreateIdea({
              phaseId: phase.body.data.id,
              ideaTitle,
              ideaContent,
            }).then((_idea) => {
              cy.visit('/admin/ideas/');
              // click on title of first idea
              cy.get('.e2e-idea-manager-idea-title')
                .first()
                .click({ force: true })
                .then(() => {
                  // check if the modal popped out and has the idea in it
                  cy.get('#e2e-modal-container').should('exist');
                  // delete the idea
                  cy.get('#e2e-input-manager-side-modal-delete-button').click();
                  // click the browser's confirm button
                  cy.on('window:confirm', () => true);
                  // check if the modal is no longer on the page
                  cy.get('#e2e-modal-container').should('not.exist');
                });
            });
          });
      });
    });
  });

  describe('Assignee select', () => {
    const firstName = randomString(5);
    const lastName = randomString(5);
    const email = randomEmail();
    const password = randomString();
    let newAdminFirstName: string;
    let newAdminLastName: string;
    let adminUserId: string;

    before(() => {
      cy.apiCreateAdmin(firstName, lastName, email, password).then(
        (newAdmin) => {
          adminUserId = newAdmin.body.data.id;
          newAdminFirstName = newAdmin.body.data.attributes.first_name;
          newAdminLastName = newAdmin.body.data.attributes.last_name;
        }
      );
      cy.logout();
      cy.setAdminLoginCookie();
    });

    after(() => {
      cy.apiRemoveUser(adminUserId);
    });

    afterEach(() => {
      if (Object.keys(probe).length === 0) return;
      cy.window({ log: false }).then((win) => {
        observer?.disconnect();
        probe.activeAfter = describeEl(win.document.activeElement);
        probe.stillAttached = probedSelect
          ? win.document.contains(probedSelect)
          : null;
        probe.selectValueAfter = probedSelect?.value;
        cy.task(
          'log',
          `PROBE ${JSON.stringify(probe)} REMOVALS ${JSON.stringify(removals)}`
        );
        probe = {};
      });
    });

    it('Assigns a user to an idea', () => {
      const optionLabelText1 = 'Unassigned';
      const optionLabelText2 = `Assigned to ${newAdminFirstName} ${newAdminLastName}`;

      cy.intercept('GET', '**/web_api/v1/ideas?*assignee=unassigned*').as(
        'unassignedIdeas'
      );
      cy.intercept('PATCH', '**/web_api/v1/ideas/*').as('assignIdea');

      cy.visit('/admin/ideas/');
      selectAssigneeFilter(optionLabelText1);
      checkSelectedAssigneeFilter(optionLabelText1);

      cy.wait('@unassignedIdeas')
        .its('response.body.data')
        .then((ideas: { id: string }[]) => {
          probeAssigneeSelect(
            `[data-cy="e2e-idea-row-${ideas[0].id}"]`,
            optionLabelText2
          ).select(optionLabelText2);
        });
      // A value set on a detached select never reaches React, so the request is
      // what proves the assignment actually happened.
      cy.wait('@assignIdea').its('response.statusCode').should('eq', 200);

      // Select this user in the assignee filter
      cy.intercept('GET', `**/web_api/v1/ideas?*assignee=${adminUserId}*`).as(
        'assignedIdeas'
      );
      selectAssigneeFilter(optionLabelText2);
      checkSelectedAssigneeFilter(optionLabelText2);

      // Check if idea is there
      cy.wait('@assignedIdeas');
      cy.get('.e2e-idea-manager-idea-row').should('have.length', 1);
    });
  });
});
