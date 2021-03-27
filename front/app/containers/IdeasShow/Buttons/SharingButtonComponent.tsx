import React from 'react';
import IdeaCTAButton from './IdeaCTAButton';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

interface Props {
  onClick?: () => void;
  ariaExpanded?: boolean;
}

const SharingButtonComponent = ({
  intl: { formatMessage },
  onClick,
  ariaExpanded,
}: Props & InjectedIntlProps) => {
  return (
    <IdeaCTAButton
      iconName="share-arrow"
      buttonText={formatMessage(messages.share)}
      onClick={onClick}
      ariaExpanded={ariaExpanded}
    />
  );
};

export default injectIntl(SharingButtonComponent);
