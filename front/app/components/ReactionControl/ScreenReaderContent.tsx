import React from 'react';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

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
