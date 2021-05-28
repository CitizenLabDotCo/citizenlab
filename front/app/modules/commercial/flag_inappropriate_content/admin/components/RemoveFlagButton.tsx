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
  selectedRowsWithContentWarningLength: number;
}

const RemoveFlagButton = ({
  processing,
  onClick,
  selectedRowsWithContentWarningLength,
}: Props) => {
  const locale = useLocale();

  const handleOnClick = () => {};

  if (!isNilOrError(locale) && selectedRowsWithContentWarningLength > 0) {
    return (
      <Button
        icon="exclamation-trapezium-strikethrough"
        buttonStyle="cl-blue"
        processing={processing}
        onClick={handleOnClick}
        locale={locale}
      >
        <FormattedMessage
          {...messages.removeWarning}
          values={{
            numberOfItems: selectedRowsWithContentWarningLength,
          }}
        />
      </Button>
    );
  }

  return null;
};

export default RemoveFlagButton;
