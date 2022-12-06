import React, { memo, useCallback } from 'react';
import { WrappedComponentProps } from 'react-intl';
// i18n
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import IdeaCTAButton from './IdeaCTAButton';

interface Props {
  className?: string;
}

const GoToCommentsButton = memo<Props & WrappedComponentProps>(
  ({ className, intl: { formatMessage } }) => {
    const onClick = useCallback(() => {
      const commentInputElementAnchor = document.getElementById(
        'submit-comment-anchor'
      );
      const commentInputElement = document.getElementById('submit-comment');

      if (commentInputElementAnchor && commentInputElement) {
        commentInputElement.focus({ preventScroll: true });
        setTimeout(() => {
          commentInputElementAnchor.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 200);
      }
    }, []);

    return (
      <IdeaCTAButton
        onClick={onClick}
        className={className}
        buttonText={formatMessage(messages.commentCTA)}
        iconName="comments"
      />
    );
  }
);

export default injectIntl(GoToCommentsButton);
