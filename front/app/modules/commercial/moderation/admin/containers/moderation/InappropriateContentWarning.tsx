import React from 'react';
import styled from 'styled-components';
import { Icon, colors, Button, fontSizes } from 'cl2-component-library';

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
  width: 15px;
`;

const IgnoreWarningButton = styled(Button)``;

interface Props {}

const InappropriateContentWarning = ({
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  return (
    <Container>
      <WarningIcon name="error" />
      <WarningContent>{formatMessage(messages.warningText)} </WarningContent>
      <IgnoreWarningButton
        locale="en"
        padding="0"
        buttonStyle="text"
        fontSize={`${fontSizes.small}px`}
        textColor={colors.clBlue}
        textDecoration="underline"
        textDecorationHover="underline"
      >
        (ignore warning)
      </IgnoreWarningButton>
    </Container>
  );
};

export default injectIntl(InappropriateContentWarning);
