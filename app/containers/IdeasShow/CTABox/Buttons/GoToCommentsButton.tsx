import React from 'react';
import IdeaCTAButton from './IdeaCTAButton';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface Props {
  className?: string;
}

const GoToCommentsButton = ({
  className,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const onClick = () => {
    const commentInputField = document.getElementById('comments-main-title');

    if (commentInputField) {
      commentInputField.scrollIntoView({ behavior: 'smooth' });
    }
  };
  // TODO: add icon
  return (
    <IdeaCTAButton
      onClick={onClick}
      className={className}
      copy={formatMessage(messages.postComment)}
      iconName="comments"
    />
  );
};

export default injectIntl(GoToCommentsButton);
