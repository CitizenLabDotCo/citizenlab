import React from 'react';

// api
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// components
import { Button, ButtonProps, Icon } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

// styling
import { colors } from 'utils/styleUtils';
import { useTheme } from 'styled-components';

interface Props {
  onClick: ButtonProps['onClick'];
  disabled?: boolean;
  processing?: boolean;
  isInBasket: boolean;
  budget: number;
  buttonMessage: MessageDescriptor;
}

const AddToBasketButton = ({
  onClick,
  disabled,
  processing,
  isInBasket,
  budget,
  buttonMessage,
}: Props) => {
  const theme = useTheme();
  const { data: appConfig } = useAppConfiguration();

  const currency = appConfig?.data.attributes.settings.core.currency;

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      processing={processing}
      bgColor={isInBasket ? colors.green500 : colors.white}
      textColor={isInBasket ? colors.white : theme.colors.tenantPrimary}
      textHoverColor={isInBasket ? colors.white : theme.colors.tenantPrimary}
      bgHoverColor={isInBasket ? colors.green500 : 'white'}
      borderColor={isInBasket ? '' : theme.colors.tenantPrimary}
      width="100%"
      className={`e2e-assign-budget-button ${
        isInBasket ? 'in-basket' : 'not-in-basket'
      }`}
    >
      {isInBasket && <Icon mb="4px" fill="white" name="check" />}
      <FormattedMessage {...buttonMessage} />
      {` (${budget} ${currency})`}
    </Button>
  );
};

export default AddToBasketButton;
