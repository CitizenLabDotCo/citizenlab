import React from 'react';
import IdeaCTAButton from './IdeaCTAButton';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../../messages';

interface Props {
  onClick?: () => void;
  ariaExpanded?: boolean;
}

const SharingButtonComponent = ({ onClick, ariaExpanded }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <IdeaCTAButton
      iconName="share"
      buttonText={formatMessage(messages.share)}
      onClick={onClick}
      ariaExpanded={ariaExpanded}
    />
  );
};

export default SharingButtonComponent;
