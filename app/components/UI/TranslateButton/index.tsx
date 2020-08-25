import React from 'react';

// components
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styles
import { colors, fontSizes } from 'utils/styleUtils';

interface Props {
  translateButtonClicked: boolean;
  onClick: () => void;
  className?: string;
}

const TranslateButton = (props: Props) => {
  const { translateButtonClicked, className, onClick } = props;

  return (
    <Button
      buttonStyle="secondary-outlined"
      onClick={onClick}
      spinnerColor={colors.label}
      className={className}
      fontSize={`${fontSizes.small}px`}
      padding="5px 10px"
      fontWeight="500"
      icon="translate"
      borderColor={colors.separation}
      width="fit-content"
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
