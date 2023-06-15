import React from 'react';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  likesCount: number;
  dislikesCount: number;
}

const ScreenReaderContent = ({ likesCount, dislikesCount }: Props) => {
  return (
    <ScreenReaderOnly>
      <FormattedMessage
        {...messages.a11y_likesDislikes}
        values={{ likesCount, dislikesCount }}
      />
    </ScreenReaderOnly>
  );
};

export default ScreenReaderContent;
