import React from 'react';

import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

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
      icon="translate"
      onClick={onClick}
      className={className}
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
