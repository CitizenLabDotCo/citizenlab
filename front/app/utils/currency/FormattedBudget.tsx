import React from 'react';
import { WrappedComponentProps, FormattedNumber } from 'react-intl';
import { Icon } from '@citizenlab/cl2-component-library';
import useAppConfiguration from 'hooks/useAppConfiguration';
// i18n
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import messages from './messages';

const StyledIcon = styled(Icon)`
  margin-top: 3px;
  margin-right: 7px;
  display: inline-block;
  overflow: hidden;
`;

interface Props {
  value: number;
}

const FormattedBudget = ({
  value,
  intl: { formatMessage, formatNumber },
}: Props & WrappedComponentProps) => {
  const appConfiguration = useAppConfiguration();

  if (!isNilOrError(appConfiguration)) {
    const currency = appConfiguration.attributes.settings.core.currency;

    // custom implementations for custom currencies
    // see appConfiguration.ts for all currencies
    if (currency === 'TOK') {
      return (
        <>
          <StyledIcon name="token" />
          {formatNumber(value)}
        </>
      );
    } else if (currency === 'CRE') {
      return (
        <>
          {formatMessage(
            value === 1 ? messages.oneCredit : messages.multipleCredits,
            {
              numberOfTokens: formatNumber(value),
            }
          )}
        </>
      );
    } else {
      return (
        <FormattedNumber
          value={value}
          style="currency"
          currency={currency}
          minimumFractionDigits={0}
          maximumFractionDigits={0}
        />
      );
    }
  }

  return null;
};

export default injectIntl(FormattedBudget);
