import { defineMessages } from 'react-intl';

export default defineMessages({
  lifecycle: {
    id: 'app.components.PhasePreview.lifecycle',
    defaultMessage: 'Preview phase state',
  },
  before: {
    id: 'app.components.PhasePreview.before',
    defaultMessage: 'Before',
  },
  open: {
    id: 'app.components.PhasePreview.open',
    defaultMessage: 'Open',
  },
  ended: {
    id: 'app.components.PhasePreview.ended',
    defaultMessage: 'Ended',
  },
  beforeTooltip2: {
    id: 'app.components.PhasePreview.beforeTooltip2',
    defaultMessage: 'Before it starts',
  },
  openTooltip2: {
    id: 'app.components.PhasePreview.openTooltip2',
    defaultMessage: 'While it’s open',
  },
  endedTooltip2: {
    id: 'app.components.PhasePreview.endedTooltip2',
    defaultMessage: 'After it ends',
  },
  newPhase: {
    id: 'app.components.PhasePreview.savePhaseFirst',
    defaultMessage: 'Save this phase to preview its participation form.',
  },
  blocked: {
    id: 'app.components.PhasePreview.blocked',
    defaultMessage:
      'This action is not available in the preview. Nothing was saved.',
  },
});
