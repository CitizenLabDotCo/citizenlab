import React from 'react';
import { clickSocialSharingLink } from '../utils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

interface Props {
  className?: string;
  onClick: () => void;
  children: JSX.Element | JSX.Element[];
  emailSubject: string;
  emailBody: string;
}

const Email = ({
  children,
  onClick,
  className,
  emailSubject,
  emailBody,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const handleClick = (href: string) => () => {
    clickSocialSharingLink(href);
    onClick();
  };

  const href = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  return (
    <button
      className={className}
      onClick={handleClick(href)}
      aria-label={formatMessage(messages.shareByEmail)}
    >
      {children}
    </button>
  );
};

export default injectIntl(Email);
