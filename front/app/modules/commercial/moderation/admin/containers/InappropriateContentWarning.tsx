import React from 'react';
import styled from 'styled-components';
import { Icon, colors } from 'cl2-component-library';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const WarningContent = styled.div`
  color: ${colors.clRedError};
  font-weight: bold;
`;

const WarningIcon = styled(Icon)`
  color: ${colors.clRedError};
  margin-right: 5px;
  width: 16px;
`;

interface Props {}

const InappropriateContentWarning = ({
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  return (
    <Container>
      <WarningIcon name="exclamation-trapezium" />
      <WarningContent>{formatMessage(messages.warningText)} </WarningContent>
    </Container>
  );
};

export default injectIntl(InappropriateContentWarning);
