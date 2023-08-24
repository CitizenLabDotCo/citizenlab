import { defineMessages } from 'react-intl';

export default defineMessages({
  importPdf: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.importPdf',
    defaultMessage: 'Import PDF',
  },
  approve: {
    id: 'app.containers.Admin.projects.project.offlineInputs.approve',
    defaultMessage: 'Approve',
  },
  delete: {
    id: 'app.containers.Admin.projects.project.offlineInputs.delete',
    defaultMessage: 'Delete',
  },
  noPhasesInProject: {
    id: 'app.containers.Admin.projects.project.offlineInputs.TopBar.noPhasesInProject',
    defaultMessage:
      'This project does not contain any phases that can contain ideas.',
  },
  selectAnotherPhase: {
    id: 'app.containers.Admin.projects.project.offlineInputs.TopBar.selectAnotherPhase',
    defaultMessage: 'Please select another phase.',
  },
});
