import React from 'react';
import IdeaCTAButton from './IdeaCTAButton';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

const SharingButtonComponent = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  return (
    <IdeaCTAButton
      iconName="share-arrow"
      buttonText={formatMessage(messages.shareIdea)}
    />
  );
};

export default injectIntl(SharingButtonComponent);
