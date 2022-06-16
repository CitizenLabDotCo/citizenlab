import React from 'react';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

interface Props {
  className?: string;
  children: JSX.Element | JSX.Element[];
  copyLink: string;
}

const CopyLink = ({
  children,
  className,
  copyLink,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const handleClick = () => () => {
    navigator.clipboard.writeText(copyLink);
  };

  return (
    <button
      className={className}
      onClick={handleClick()}
      aria-label={formatMessage(messages.shareByLink)}
    >
      {children}
    </button>
  );
};

export default injectIntl(CopyLink);
