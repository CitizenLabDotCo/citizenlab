import React from 'react';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { LiveMessage } from 'react-aria-live';

interface Props {
  upvotesCount: number;
  downvotesCount: number;
}

const ScreenReaderContent = ({
  upvotesCount,
  downvotesCount,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  return (
    <>
      <ScreenReaderOnly>
        <FormattedMessage
          {...messages.a11y_upvotesDownvotes}
          values={{ upvotesCount, downvotesCount }}
        />
      </ScreenReaderOnly>
      <LiveMessage
        message={formatMessage(messages.a11y_upvotesDownvotes, {
          upvotesCount,
          downvotesCount,
        })}
        aria-live="polite"
      />
    </>
  );
};

export default injectIntl(ScreenReaderContent);
