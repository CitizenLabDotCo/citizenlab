import { defineMessages } from 'react-intl';

export default defineMessages({
  tokens: {
    id: 'app.utils.FormattedCurrency.tokens',
    defaultMessage: 'tokens',
  },
  xTokens: {
    id: 'app.utils.FormattedCurrency.xTokens',
    defaultMessage:
      '{numberOfTokens, plural, =0 {# tokens} one {# token} other {# tokens}}',
  },
  xCredits: {
    id: 'app.utils.FormattedCurrency.xCredits',
    defaultMessage:
      '{numberOfCredits, plural, =0 {# credits} one {# credit} other {# credits}}',
  },
  credits: {
    id: 'app.utils.FormattedCurrency.credits',
    defaultMessage: 'credits',
  },
});
