import React from 'react';

// components
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styles
import { fontSizes, colors } from 'utils/styleUtils';
import { useTheme } from 'styled-components';

interface Props {
  translateButtonClicked: boolean;
  onClick: () => void;
  className?: string;
}

const TranslateButton = (props: Props) => {
  const { translateButtonClicked, className, onClick } = props;
  const theme: any = useTheme();

  return (
    <Button
      buttonStyle="secondary-outlined"
      onClick={onClick}
      className={className}
      icon="translate"
      iconColor={colors.label}
      fontSize={`${fontSizes.small}px`}
      fontWeight={'bold'}
      padding="10px 10px"
      textColor={theme.colorText}
    >
      {translateButtonClicked ? (
        <FormattedMessage {...messages.original} />
      ) : (
        <FormattedMessage {...messages.translate} />
      )}
    </Button>
  );
};

export default TranslateButton;
