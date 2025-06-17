import React, { memo } from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const TitleWrapper = styled.div`
  min-height: 105px;

  h2 {
    padding: 0;
    margin: 10px;
    margin-top: 20px;
    margin-bottom: 30px;
    color: ${colors.textSecondary};
    font-size: ${fontSizes.base}px;
    font-weight: 400;
  }
`;

export const FirstRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-left: 10px;
`;

export const Spacer = styled.div`
  flex: 1;
`;

export const TextAndButtons = styled.div`
  h1 {
    display: inline;
    padding: 0;
    margin: 0;
    margin-right: 10px;
    font-weight: 600;
  }
`;

interface Props {
  title: Record<string, string>;
  subtitle?: Record<string, string>;
}

const UsersHeader = memo(({ title, subtitle }: Props) => {
  return (
    <TitleWrapper>
      <FirstRow>
        <TextAndButtons>
          <FormattedMessage tagName="h1" {...title} />
        </TextAndButtons>
        <Spacer />
        <ButtonWithLink
          linkTo="/admin/dashboard/users"
          text={<FormattedMessage {...messages.userInsights} />}
          icon="chart-bar"
          buttonStyle="secondary-outlined"
        />
      </FirstRow>
      {subtitle && <FormattedMessage tagName="h2" {...subtitle} />}
    </TitleWrapper>
  );
});

export default UsersHeader;
