import React from 'react';
import IdeaCTAButton from './IdeaCTAButton';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

interface Props {
  onClick?: () => void;
}

const SharingButtonComponent = ({
  intl: { formatMessage },
  onClick,
}: Props & InjectedIntlProps) => {
  return (
    <IdeaCTAButton
      iconName="share-arrow"
      buttonText={formatMessage(messages.shareIdea)}
      onClick={onClick}
    />
  );
};

export default injectIntl(SharingButtonComponent);
