import React, { memo } from 'react';
import { adopt } from 'react-adopt';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// utils
import { getFormattedBudget, isNilOrError } from 'utils/helperUtils';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div``;

const Budget = styled.div`
  color: ${(props) => props.theme.colorText};
  font-size: ${(props) => props.theme.fontSizes.large}px;
  ${media.smallerThanMinTablet`
    font-size: ${(props) => props.theme.fontSizes.base}px;
  `}
  font-weight: 300;
`;

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
}

interface InputProps {
  className?: string;
  proposedBudget: number;
}

interface Props extends InputProps, DataProps {}

const IdeaProposedBudget = memo<Props>(
  ({ proposedBudget, className, locale, tenant }) => {
    if (isNilOrError(locale) || isNilOrError(tenant)) return null;

    const currency = tenant.attributes.settings.core.currency;
    const formattedBudget = getFormattedBudget(
      locale,
      proposedBudget,
      currency
    );

    return (
      <Container className={className}>
        <Budget>{formattedBudget}</Budget>
      </Container>
    );
  }
);

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaProposedBudget {...inputProps} {...dataProps} />}
  </Data>
);
