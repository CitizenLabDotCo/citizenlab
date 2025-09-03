import { defineMessages } from 'react-intl';

export default defineMessages({
  manualVoteAdjustment: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualVoteAdjustment3',
    defaultMessage: 'Offline votes adjustment',
  },
  manualPickAdjustment: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualPickAdjustment2',
    defaultMessage: 'Offline picks adjustment',
  },
  manualVotersTooltip1: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualVotersTooltip1a',
    defaultMessage:
      'In order to calculate the correct results, we need to know the <b>total amount of offline participants for this phase</b>.',
  },
  manualVotersTooltip2: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualVotersTooltip2',
    defaultMessage: 'Please indicate only those that participated offline.',
  },
  manualVotersDisabledTooltip: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualVotersDisabledTooltip',
    defaultMessage: 'You must enter the total offline participants first.',
  },
  manualVotersLabel: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualVotersLabel2',
    defaultMessage: 'Total offline participants',
  },
  modifiedBy: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.modifiedBy',
    defaultMessage: 'Modified by {name}',
  },
  manualVoteAdjustmentTooltip1: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualVoteAdjustmentTooltip',
    defaultMessage:
      'This option allows you to include participation data from other sources, such as in-person or paper votes:',
  },
  manualVoteAdjustmentTooltip2: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualVoteAdjustmentTooltip2',
    defaultMessage: 'It will be visually distinct from digital votes.',
  },
  manualVoteAdjustmentTooltip3: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualVoteAdjustmentTooltip3',
    defaultMessage: 'It will affect the final vote results.',
  },
  manualVoteAdjustmentTooltip4: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualVoteAdjustmentTooltip4',
    defaultMessage:
      'It will not be reflected in participation data dashboards.',
  },
  manualVoteAdjustmentTooltip5: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualVoteAdjustmentTooltip7',
    defaultMessage:
      'Offline votes for an option can only be set once in a project, and are shared between all phases of a project.',
  },
});
