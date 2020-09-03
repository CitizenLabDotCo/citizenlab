import React from 'react';
import IdeaCTAButton from './IdeaCTAButton';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

interface Props {
  className?: string;
}

const GoToCommentsButton = ({
  className,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const onClick = () => {
    const commentInputField = document.getElementById('submit-comment');

    // We wait until the component is scrolled too, then the text area is focused
    // https://stackoverflow.com/questions/46795955/how-to-know-scroll-to-element-is-done-in-javascript
    if (commentInputField) {
      const intersectionObserver = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setTimeout(() => commentInputField.focus(), 100);
        }
      });

      intersectionObserver.observe(commentInputField);

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
