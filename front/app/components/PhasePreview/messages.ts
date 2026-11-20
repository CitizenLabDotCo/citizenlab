import { defineMessages } from 'react-intl';

export default defineMessages({
  beforeStarts: {
    id: 'app.components.PhasePreview.beforeStarts',
    defaultMessage: 'This phase has not started yet',
  },
  phaseEnded: {
    id: 'app.components.PhasePreview.phaseEnded',
    defaultMessage: 'Phase ended',
  },
  startsIn: {
    id: 'app.components.PhasePreview.startsIn',
    defaultMessage:
      '{days, plural, =0 {Starts today} one {Starts in # day} other {Starts in # days}}',
  },
});
