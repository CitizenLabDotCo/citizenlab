import React from 'react';

import { Icon } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { useIntl } from 'utils/cl-intl';

import useFormatCurrency from './useFormatCurrency';

const StyledIcon = styled(Icon)`
  margin-top: 3px;
  margin-right: 7px;
  display: inline-block;
  overflow: hidden;
`;

interface Props {
  value: number;
}

const FormattedBudget = ({ value }: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const { formatNumber } = useIntl();
  const formatCurrency = useFormatCurrency();

  if (!appConfiguration) return null;

  const currency = appConfiguration.data.attributes.settings.core.currency;

  // Custom implementations for 'TOK' currency for this component.
  // Others are dealt with by the useFormatCurrency hook.
  if (currency === 'TOK') {
    return (
      <>
        <StyledIcon name="token" />
        {formatNumber(value)}
      </>
    );
  } else {
    return <>{formatCurrency(value)}</>;
  }
};

export default FormattedBudget;
