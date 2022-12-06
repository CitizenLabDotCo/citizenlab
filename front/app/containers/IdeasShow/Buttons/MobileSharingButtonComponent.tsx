import React from 'react';
import { WrappedComponentProps } from 'react-intl';
// i18n
import { injectIntl } from 'utils/cl-intl';
import Button from 'components/UI/Button';
import messages from '../messages';

interface Props {
  onClick?: () => void;
  ariaExpanded?: boolean;
}

const MobileSharingButtonComponent = ({
  onClick,
  ariaExpanded,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  return (
    <Button
      buttonStyle="white"
      borderColor="#ccc"
      icon="share"
      onClick={onClick}
      ariaExpanded={ariaExpanded}
    >
      {formatMessage(messages.share)}
    </Button>
  );
};

export default injectIntl(MobileSharingButtonComponent);
