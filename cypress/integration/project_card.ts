describe('Project card component', () => {
  let adminJwt: string = null as any;

  const apiCreateProject = (type: 'timeline' | 'continuous', title: string, descriptionPreview: string, description: string) => {
    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'POST',
      url: 'web_api/v1/projects',
      body: {
        project: {
          process_type: type,
          title_multiloc: {
            'en-GB': title,
            'nl-BE': title
          },
          description_preview_multiloc: {
            'en-GB': descriptionPreview,
            'nl-BE': descriptionPreview
          },
          description_multiloc: {
            'en-GB': description,
            'nl-BE': description
          }
        }
      }
    });
  };

  const apiCreatePhase = (
    projectId: string,
    title: string,
    startAt: string,
    endAt: string,
    participationMethod: 'ideation' | 'information' | 'survey' | 'budgeting',
    canPost: boolean,
    canVote: boolean,
    canComment: boolean
  ) => {
    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'POST',
      url: `web_api/v1/projects/${projectId}/phases`,
      body: {
        phase: {
          start_at: startAt,
          end_at: endAt,
          title_multiloc: {
            'en-GB': title,
            'nl-BE': title
          },
          participation_method: participationMethod,
          posting_enabled: canPost,
          voting_enabled: canVote,
          commenting_enabled: canComment
        }
      }
    });
  };

  before(() => {
    cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => adminJwt = response.body.jwt);
  });

  it('shows the title, description, progress bar and cta', () => {
    const projectTitle = Math.random().toString(36);
    const projectDescriptionPreview = Math.random().toString(36);
    const projectDescription = Math.random().toString(36);
    const phaseTitle = Math.random().toString(36);

    apiCreateProject('timeline', projectTitle, projectDescriptionPreview, projectDescription).then((project) => {
      return apiCreatePhase(project.body.data.id as string, phaseTitle, '2018-03-01', '2025-01-01', 'ideation', true, true, true);
    }).then((phase) => {
      cy.visit('/');
      cy.get('.e2e-project-card').contains(projectTitle).closest('.e2e-project-card').as('projectCard');
      cy.get('@projectCard').get('#e2e-project-card-project-title').contains(projectTitle);
      cy.get('@projectCard').get('#e2e-project-card-project-description-preview').contains(projectDescriptionPreview);
      cy.get('@projectCard').get('.e2e-project-card-time-remaining');
      cy.get('@projectCard').get('.e2e-project-card-cta').contains('Post your idea');
    });
  });
});
