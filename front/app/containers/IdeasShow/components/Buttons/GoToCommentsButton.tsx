import React, { useCallback } from 'react';
import IdeaCTAButton from './IdeaCTAButton';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../../messages';

interface Props {
  className?: string;
}

const GoToCommentsButton = ({ className }: Props) => {
  const { formatMessage } = useIntl();
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
};
export default GoToCommentsButton;
