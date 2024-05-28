import { FormatMessage } from 'typings';

import messages from './messages';

export const createGSQuote = (formatMessage: FormatMessage) => {
  const quote = `<p><strong>${formatMessage(
    messages.placeholderQuote
  )}</strong></p>`;
  const manager = `<p class="ql-align-center"><strong>(NAME), ${formatMessage(
    messages.clGSManager
  )}</strong></p>`;

  return `${quote}\n${manager}`;
};
