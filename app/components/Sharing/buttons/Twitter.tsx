import React from 'react';
import { TwitterButton } from 'react-social';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

interface Props {
  className?: string;
  onClick: () => void;
  children: JSX.Element | JSX.Element[];
  url: string;
  twitterMessage: string;
}

const Twitter = ({
  children,
  onClick,
  className,
  url,
  twitterMessage,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <TwitterButton
      message={twitterMessage}
      url={url}
      className={className}
      onClick={handleClick}
      sharer={true}
      aria-label={formatMessage(messages.shareOnTwitter)}
    >
      {children}
    </TwitterButton>
  );
};

export default injectIntl(Twitter);
