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
  beforeStarts: {
    id: 'app.components.PhasePreview.beforeStarts',
    defaultMessage: 'This phase has not started yet',
  },
  phaseEnded: {
    id: 'app.components.PhasePreview.phaseEnded',
    defaultMessage: 'Phase ended',
  },
  noDates: {
    id: 'app.components.PhasePreview.noDates',
    defaultMessage: 'Dates to be announced',
  },
  viewBefore: {
    id: 'app.components.PhasePreview.viewBefore',
    defaultMessage: 'What residents see before the phase starts',
  },
  viewOpen: {
    id: 'app.components.PhasePreview.viewOpen',
    defaultMessage: 'What residents see while the phase is open',
  },
  viewEnded: {
    id: 'app.components.PhasePreview.viewEnded',
    defaultMessage: 'What residents see after the phase ends',
  },
  startsIn: {
    id: 'app.components.PhasePreview.startsIn',
    defaultMessage:
      '{days, plural, =0 {Starts today} one {Starts in # day} other {Starts in # days}}',
  },
  newPhase: {
    id: 'app.components.PhasePreview.savePhaseFirst',
    defaultMessage: 'Save this phase to preview its participation form.',
  },
});
