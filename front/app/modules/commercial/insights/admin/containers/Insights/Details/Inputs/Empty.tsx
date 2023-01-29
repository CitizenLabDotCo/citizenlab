import React from 'react';

// intl
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../../messages';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  text-align: center;
  color: ${colors.textSecondary};
  h2 {
    padding-top: 200px;
    font-size: ${fontSizes.base}px;
  }
`;

const Empty = ({ intl: { formatMessage } }: WrappedComponentProps) => {
  return (
    <Container data-testid="insightsDetailsEmpty">
      <h2>{formatMessage(messages.inputsEmptyTitle)}</h2>
      <p>{formatMessage(messages.inputsEmptyDescription)}</p>
    </Container>
  );
};

export default injectIntl(Empty);
