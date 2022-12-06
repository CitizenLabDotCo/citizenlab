import React from 'react';
import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
// i18n
import messages from './messages';

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
