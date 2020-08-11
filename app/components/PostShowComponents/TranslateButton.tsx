import React from 'react';

// components
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styles
import { fontSizes } from 'utils/styleUtils';

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
      className={className}
      icon="translate"
      fontSize={`${fontSizes.small}px`}
      padding="5px 10px"
    >
      {translateButtonClicked ? (
        <FormattedMessage {...messages.seeOriginal} />
      ) : (
        <FormattedMessage {...messages.seeTranslation} />
      )}
    </Button>
  );
};

export default TranslateButton;
