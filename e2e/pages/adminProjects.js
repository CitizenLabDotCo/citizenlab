const commands = {
  openLastProject() {
    return this
    .waitForElementVisible('.e2e-project-card')
    .click('.e2e-project-card:last-child a')
    .waitForElementVisible('@generalForm');
  },
};

module.exports = {
  url: `http://${process.env.ROOT_URL}/admin/projects`,
  elements: {
    projectsList: { selector: '.e2e-projects-list' },
    newProject: { selector: '.e2e-new-project' },
    projectCard: { selector: '.e2e-project-card' },
    generalForm: { selector: '.e2e-project-general-form' },
    descriptionForm: { selector: '.e2e-project-description-form' },
    submitButton: { selector: '.e2e-submit-wrapper-button' },
    submitSuccess: { selector: '.e2e-submit-wrapper-button + .success' },
    descriptionTab: { selector: '.e2e-resource-tabs .description' },
    phasesTab: { selector: '.e2e-resource-tabs .phases a' },
    eventsTab: { selector: '.e2e-resource-tabs .events a' },
    permissionsTab: { selector: '.e2e-resource-tabs .permissions a' },
    ideasTab: { selector: '.e2e-resource-tabs .ideas a' },
    addPhaseButton: { selector: '.e2e-add-phase-button' },
  },
  commands: [commands],
};
