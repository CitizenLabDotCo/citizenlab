import React from 'react';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../../messages';

// components
import PageTitle from 'components/admin/PageTitle';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

const StyledDescription = styled.p`
  font-size: ${fontSizes.base}px;
  width: 50%;
  margin: 0;
`;

const StyledLink = styled.a`
  cursor: pointer;
  font-size: ${fontSizes.base}px;
  color: ${colors.clBlue};
  font-weight: 600;
  text-decoration: underline;
  &:hover {
    color: ${darken(0.2, colors.clBlue)};
    text-decoration: underline;
  }
`;

const InsightsList: React.FC<InjectedIntlProps> = ({
  intl: { formatMessage },
}) => {
  return (
    <div>
      <PageTitle>{formatMessage(messages.insightsTitle)}</PageTitle>
      <StyledDescription>
        {formatMessage(messages.insightsDescription)}
      </StyledDescription>

      <StyledLink>{formatMessage(messages.insightsLink)}</StyledLink>
    </div>
  );
};

export default injectIntl(InsightsList);
