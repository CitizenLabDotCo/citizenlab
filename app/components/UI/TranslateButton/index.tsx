import React from 'react';

// components
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styles
import { fontSizes, colors } from 'utils/styleUtils';
import { withTheme } from 'styled-components';

interface Props {
  translateButtonClicked: boolean;
  onClick: () => void;
  className?: string;
  theme: any;
}

const TranslateButton = (props: Props) => {
  const { translateButtonClicked, className, onClick } = props;

  return (
    <Button
      buttonStyle="secondary-outlined"
      onClick={onClick}
      className={className}
      icon="translate"
      iconColor={colors.label}
      fontSize={`${fontSizes.small}px`}
      fontWeight={'bold'}
      padding="5px 10px"
      textColor={props.theme.colorText}
    >
      {translateButtonClicked ? (
        <FormattedMessage {...messages.original} />
      ) : (
        <FormattedMessage {...messages.translate} />
      )}
    </Button>
  );
};

export default withTheme(TranslateButton);
