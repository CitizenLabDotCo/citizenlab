import { defineMessages } from 'react-intl';

export default defineMessages({
  manualVoteAdjustment: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualVoteAdjustment',
    defaultMessage: 'Manual vote adjustment',
  },
  manualPickAdjustment: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualPickAdjustment',
    defaultMessage: 'Manual picks adjustment',
  },
  manualVotersTooltip: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualVotersTooltip',
    defaultMessage:
      'In order to showcase the correct results, we need to know the total amount of participants for this phase. \n\nPlease indicate only those that have not participated online.',
  },
  manualVotersLabel: {
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualVotersLabel',
    defaultMessage: 'Total in-person participants',
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
    id: 'app.components.admin.PostManager.PostPreview.OfflineVoteSettings.manualVoteAdjustmentTooltip6',
    defaultMessage:
      'Manual votes for an option are shared between all phases of a project.',
  },
});
