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
      let observer: IntersectionObserver;

      const callback = (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setTimeout(() => {
            commentInputField.focus();
            observer.unobserve(commentInputField);
          }, 100);
        }
      };

      observer = new IntersectionObserver(callback);
      observer.observe(commentInputField);

      // commentInputField.scrollIntoView({ behavior: 'smooth' });

      const scrollContainer =
        document.getElementsByClassName(
          'fullscreenmodal-scrollcontainer'
        )?.[0] || window;
      const top =
        commentInputField.getBoundingClientRect().top +
        window.pageYOffset -
        150;
      const behavior = 'smooth';
      scrollContainer.scrollTo({ top, behavior });
    }
  };

  return (
    <IdeaCTAButton
      onClick={onClick}
      className={className}
      buttonText={formatMessage(messages.commentCTA)}
      iconName="comments"
    />
  );
};

export default injectIntl(GoToCommentsButton);
