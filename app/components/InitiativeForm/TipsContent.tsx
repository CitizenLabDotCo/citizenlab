import React, { memo } from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styles
import styled, { withTheme } from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  padding: 20px;
`;

interface Props {
  theme: any;
}

const TipsContent = memo<Props>((_props) => {
  return (
    <Container>
      <p>
        <FormattedMessage {...messages.tipsExplanation} />
      </p>
    </Container>
  );
});

export default withTheme(TipsContent);
