import React from 'react';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  upvotesCount: number;
  downvotesCount: number;
}

const ScreenReaderContent = ({ upvotesCount, downvotesCount }: Props) => {
  return (
    <ScreenReaderOnly>
      <FormattedMessage
        {...messages.a11y_upvotesDownvotes}
        values={{ upvotesCount, downvotesCount }}
      />
    </ScreenReaderOnly>
  );
};

export default ScreenReaderContent;
