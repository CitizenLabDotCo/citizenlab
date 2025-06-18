import React from 'react';

import ButtonWithLink from 'components/UI/ButtonWithLink';

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
    <ButtonWithLink
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
    </ButtonWithLink>
  );
};

export default TranslateButton;
