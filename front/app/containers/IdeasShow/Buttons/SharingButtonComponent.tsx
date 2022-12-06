import React from 'react';
import { WrappedComponentProps } from 'react-intl';
// i18n
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import IdeaCTAButton from './IdeaCTAButton';

interface Props {
  onClick?: () => void;
  ariaExpanded?: boolean;
}

const SharingButtonComponent = ({
  intl: { formatMessage },
  onClick,
  ariaExpanded,
}: Props & WrappedComponentProps) => {
  return (
    <IdeaCTAButton
      iconName="share"
      buttonText={formatMessage(messages.share)}
      onClick={onClick}
      ariaExpanded={ariaExpanded}
    />
  );
};

export default injectIntl(SharingButtonComponent);
