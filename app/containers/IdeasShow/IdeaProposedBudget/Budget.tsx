import React, { memo } from 'react';

// typings
import { ITenant } from 'services/tenant';
import { Locale } from 'typings';

// utils
import { getFormattedBudget } from 'utils/helperUtils';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  color: ${(props) => props.theme.colorText};
  font-size: ${(props) => props.theme.fontSizes.large}px;
  ${media.smallerThanMinTablet`
    font-size: ${(props) => props.theme.fontSizes.base}px;
  `}
  font-weight: 300;
`;

interface Props {
  className?: string;
  proposedBudget: number;
  locale: Locale;
  tenant: ITenant;
}

const Budget = memo<Props>(({ proposedBudget, className, locale, tenant }) => {
  const currency = tenant.data.attributes.settings.core.currency;
  const formattedBudget = getFormattedBudget(locale, proposedBudget, currency);

  return <Container className={className}>{formattedBudget}</Container>;
});

export default Budget;
