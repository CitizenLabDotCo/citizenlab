import React from 'react';
import { Button } from 'cl2-component-library';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  processing: boolean;
  onClick: () => void;
  selectedModerationItemsWithContentWarningLength: number;
}

const RemoveFlagButton = ({
  processing,
  onClick,
  selectedModerationItemsWithContentWarningLength,
}: Props) => {
  const locale = useLocale();

  if (
    !isNilOrError(locale) &&
    selectedModerationItemsWithContentWarningLength > 0
  ) {
    return (
      <Button
        icon="exclamation-trapezium-strikethrough"
        buttonStyle="cl-blue"
        processing={processing}
        onClick={onClick}
        locale={locale}
      >
        <FormattedMessage
          {...messages.removeWarning}
          values={{
            numberOfItems: selectedModerationItemsWithContentWarningLength,
          }}
        />
      </Button>
    );
  }

  return null;
};

export default RemoveFlagButton;
