import React from 'react';
import { IconButton } from '@citizenlab/cl2-component-library';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface Props {
  onClick: () => void;
  a11y_buttonActionDescription: string;
}

const CloseIconButton = ({
  onClick,
  a11y_buttonActionDescription,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  return (
    <IconButton
      iconName="close"
      onClick={onClick}
      a11y_buttonActionDescription={
        a11y_buttonActionDescription ||
        formatMessage(messages.a11y_closeButtonActionDescriptionFallBack)
      }
    />
  );
};

export default injectIntl(CloseIconButton);
