import React from 'react';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import { Title, Box, stylingConsts } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import CloseIconButton from 'components/UI/CloseIconButton';

// intl
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const StyledBox = styled(Box)`
  box-shadow: -2px 0px 1px 0px rgba(0, 0, 0, 0.06);
`;

const StyledCloseIconButton = styled(CloseIconButton)`
  position: absolute;
  right: 8px;
`;

const SurveyBuilderSettings = () => (
  <StyledBox
    position="fixed"
    right="0"
    top={`${stylingConsts.menuHeight}px`}
    zIndex="99999"
    p="20px"
    w="400px"
    h="100%"
    background="#ffffff"
  >
    <StyledCloseIconButton
      a11y_buttonActionMessage={messages.close}
      onClick={() => {}}
      iconColor={colors.label}
      iconColorOnHover={'#000'}
    />
    <Title variant="h2">
      <FormattedMessage {...messages.shortAnswer} />
    </Title>
    <Box display="flex">
      <Button
        id="e2e-delete-button"
        icon="delete"
        buttonStyle="primary-outlined"
        borderColor={colors.red500}
        textColor={colors.red500}
        iconColor={colors.red500}
        onClick={() => {
          // TODO: Handle delete
        }}
      >
        <FormattedMessage {...messages.delete} />
      </Button>
    </Box>
  </StyledBox>
);

export default SurveyBuilderSettings;
