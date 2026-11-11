import { format, subMonths } from 'date-fns';

import { IPhaseInsights } from '../../../app/api/phase_insights/types';
import { ParticipationMethod } from '../../../app/api/phases/types';
import { randomString } from '../../support/commands';

describe('Redesigned phase Insights', () => {
  let projectId: string;
  let phaseId: string;
  let participantId: string | undefined;

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.viewport(1280, 900);
  });

  afterEach(() => {
    if (projectId) cy.apiRemoveProject(projectId);
    if (participantId) cy.apiRemoveUser(participantId);
    participantId = undefined;
  });

  const createPhase = (participationMethod: ParticipationMethod) =>
    cy
      .apiCreateProject({
        title: `Insights review ${randomString()}`,
        descriptionPreview: randomString(),
        publicationStatus: 'published',
      })
      .then((project) => {
        projectId = project.body.data.id;
        return cy
          .apiCreatePhase({
            projectId,
            title: randomString(),
            startAt: format(subMonths(new Date(), 1), 'dd/MM/yyyy'),
            participationMethod,
            canPost: true,
            canReact: true,
            surveyService:
              participationMethod === 'survey' ? 'typeform' : undefined,
            surveyUrl:
              participationMethod === 'survey'
                ? 'https://form.typeform.com/to/insights-review'
                : undefined,
            nativeSurveyTitleMultiloc:
              participationMethod === 'native_survey'
                ? { en: 'Insights survey' }
                : undefined,
            nativeSurveyButtonMultiloc:
              participationMethod === 'native_survey'
                ? { en: 'Take the survey' }
                : undefined,
          })
          .then((phase) => {
            phaseId = phase.body.data.id;
          });
      });

  const visitInsights = () =>
    cy.visit(
      `admin/projects/${projectId}/phases/${phaseId}/insights?project_backoffice_redesign`
    );

  it('shows real participation alongside report, sharing, AI and download actions', () => {
    createPhase('ideation').then(() => {
      cy.apiSignup(
        'Insights',
        'Participant',
        `${randomString()}@example.com`,
        randomString(16)
      ).then((participant) => {
        participantId = participant.body.data.id;
        return cy.apiCreateIdea({
          phaseId,
          ideaTitle: randomString(),
          ideaContent: randomString(30),
          jwt: participant._jwt,
        });
      });
      visitInsights();
      cy.get('aside[aria-label="Recommended actions"]').within(() => {
        cy.contains('button', 'Add a report').should('be.visible');
        cy.contains('button', 'Get an AI Sensemaking summary').should(
          'be.visible'
        );
        cy.contains('button', 'Download insights').click();
      });
      cy.contains('Download as PDF').should('be.visible');
      cy.contains('Download as Word').should('be.visible');
      cy.get('aside[aria-label="Recommended actions"]')
        .contains('button', 'Share results with participants')
        .click();
      cy.contains('a', 'Go to Messaging')
        .should('have.attr', 'href')
        .and('include', `/projects/${projectId}/messaging`);
      cy.contains('a', 'Create an information phase')
        .should('have.attr', 'href')
        .and('include', 'participation_method=information');
      cy.get('[aria-label="Phase Insights"]').then(($region) => {
        const bounds = $region[0].getBoundingClientRect();
        expect(bounds.right).to.be.at.most(1280);
        expect(bounds.bottom).to.be.at.most(900);
      });
      cy.get('aside[aria-label="Recommended actions"]').then(($aside) => {
        expect($aside[0].getBoundingClientRect().bottom).to.be.at.most(900);
      });
      cy.intercept('POST', '**/web_api/v1/reports', {
        statusCode: 503,
        body: {},
      }).as('createReport');
      cy.get('aside[aria-label="Recommended actions"]')
        .contains('button', 'Add a report')
        .click();
      cy.wait('@createReport');
      cy.get('[role="alert"]').should(
        'contain.text',
        'The report could not be created'
      );
    });
  });

  it('shows the empty state without recommended actions before participation', () => {
    createPhase('ideation').then(() => {
      visitInsights();
      cy.contains('Insights will appear here').should('be.visible');
      cy.contains('No insights yet').should('be.visible');
      cy.get('aside[aria-label="Recommended actions"]').should('not.exist');
    });
  });

  it('shows visitor-only insights even when there are no inputs', () => {
    createPhase('volunteering').then(() => {
      cy.intercept('GET', `**/phases/${phaseId}/insights`, (request) => {
        request.continue((response) => {
          const insights: IPhaseInsights = response.body;
          insights.data.attributes.metrics.visitors = 8;
          insights.data.attributes.metrics.participants = 0;
          insights.data.attributes.metrics.participation_rate_as_percent = 0;
        });
      });
      visitInsights();
      cy.get('[aria-label="Phase Insights"]')
        .should('contain.text', 'Visitors')
        .and('contain.text', '8');
      cy.contains('Insights will appear here').should('not.exist');
      cy.get('aside[aria-label="Recommended actions"]').should('be.visible');
      cy.contains('button', 'Get an AI Sensemaking summary').should(
        'not.exist'
      );
    });
  });

  it('refreshes participation when returning from Manage', () => {
    let visitors = 0;

    createPhase('volunteering').then(() => {
      cy.intercept('GET', `**/phases/${phaseId}/insights`, (request) => {
        request.continue((response) => {
          const insights: IPhaseInsights = response.body;
          insights.data.attributes.metrics.visitors = visitors;
        });
      });
      visitInsights();
      cy.contains('Insights will appear here').should('be.visible');
      cy.contains('a', /^Manage$/).click();
      cy.location('pathname').should('include', '/volunteering');
      cy.then(() => {
        visitors = 8;
      });
      cy.contains('a', /^Insights$/).click();
      cy.location('pathname').should('include', '/insights');
      cy.get('[aria-label="Phase Insights"]')
        .should('contain.text', 'Visitors')
        .and('contain.text', '8');
    });
  });

  it('keeps demographic fields accessible with the timeline expanded', () => {
    createPhase('ideation').then(() => {
      cy.intercept('GET', `**/phases/${phaseId}/insights`, (request) => {
        request.continue((response) => {
          const insights: IPhaseInsights = response.body;
          insights.data.attributes.metrics.participants = 1;
          insights.data.attributes.demographics.fields = Array.from(
            { length: 8 },
            (_, index) => ({
              id: `demographic-${index}`,
              key: `demographic-${index}`,
              code: null,
              input_type: 'select',
              title_multiloc: { en: `Demographic question ${index + 1}` },
              series: { north: 1 },
              options: {
                north: { title_multiloc: { en: 'North' }, ordering: 0 },
              },
              reference_distribution: { north: 1 },
            })
          );
        });
      });
      visitInsights();
      cy.get('[data-cy="e2e-insights-demographic-tabs"]').within(() => {
        cy.contains('button', 'Demographic question 8')
          .scrollIntoView()
          .click()
          .should('have.attr', 'aria-selected', 'true');
      });
      cy.get('[data-cy="e2e-insights-demographic-tabs"]').then(($tabs) => {
        const bounds = $tabs[0].getBoundingClientRect();
        expect(bounds.left).to.be.at.least(0);
        expect(bounds.right).to.be.at.most(1280);
        expect($tabs[0].scrollWidth).to.be.greaterThan($tabs[0].clientWidth);
      });
      cy.get('[aria-label="Phase Insights"]').then(($region) => {
        expect($region[0].scrollWidth).to.be.at.most($region[0].clientWidth);
      });
    });
  });

  it('preserves external survey exports without requesting unsupported metrics', () => {
    let requestedMetrics = false;

    createPhase('survey').then(() => {
      cy.intercept('GET', `**/phases/${phaseId}/insights`, (request) => {
        requestedMetrics = true;
        request.reply({ statusCode: 500, body: {} });
      });
      visitInsights();
      cy.location('pathname').should('include', '/survey-results');
      cy.contains('Consult the survey answers').should('be.visible');
      cy.then(() => {
        expect(requestedMetrics).to.eq(false);
      });
    });
  });

  it('keeps survey response exports separate from insight downloads', () => {
    createPhase('native_survey').then(() => {
      cy.intercept('GET', `**/phases/${phaseId}/insights`, (request) => {
        request.continue((response) => {
          const insights: IPhaseInsights = response.body;
          insights.data.attributes.metrics.participants = 1;
        });
      });
      visitInsights();
      cy.get('aside[aria-label="Recommended actions"]').within(() => {
        cy.contains('button', 'Export').click();

        cy.contains('Download insights').should('be.visible');
      });
      cy.contains('Export responses to Excel').should('be.visible');
    });
  });
});
