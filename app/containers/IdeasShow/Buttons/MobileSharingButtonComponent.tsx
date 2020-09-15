import React from 'react';
import Button from 'components/UI/Button';
import { useTheme } from 'styled-components';
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

interface Props {
  onClick?: () => void;
}

const MobileSharingButtonComponent = ({
  onClick,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const theme: any = useTheme();

  return (
    <Button
      bgColor="white"
      textColor={theme.colorText}
      icon="share-arrow"
      iconColor={colors.clIconSecondary}
      iconHoverColor={colors.clIconSecondary}
      iconAriaHidden
      bgHoverColor="white"
      textHoverColor={darken(0.1, theme.colorText)}
      fontWeight="bold"
      borderColor="#E0E0E0"
      onClick={onClick}
    >
      {formatMessage(messages.shareIdea)}
    </Button>
  );
};

export default injectIntl(MobileSharingButtonComponent);
