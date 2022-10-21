import Button from 'components/UI/Button';
import React from 'react';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
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
