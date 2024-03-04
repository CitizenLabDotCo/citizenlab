import React from 'react';

// styles
import styled from 'styled-components';

import {
  Title,
  Box,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import CloseIconButton from 'components/UI/CloseIconButton';

import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

import { SelectedNode } from './typings';

const StyledBox = styled(Box)`
  box-shadow: -2px 0px 1px 0px rgba(0, 0, 0, 0.06);
`;

const StyledCloseIconButton = styled(CloseIconButton)`
  position: absolute;
  right: 8px;
`;

interface Props {
  selectedNode: SelectedNode;
  onClose: () => void;
  onDelete: () => void;
}

const Settings = ({ selectedNode, onClose, onDelete }: Props) => {
  return (
    <StyledBox
      position="fixed"
      right="0"
      top={`${stylingConsts.menuHeight}px`}
      zIndex="99999"
      p="20px"
      w="400px"
      h={`calc(100vh - ${stylingConsts.menuHeight}px)`}
      background="#ffffff"
      overflowY="auto"
    >
      <StyledCloseIconButton
        className="e2eBuilderSettingsClose"
        a11y_buttonActionMessage={messages.a11y_closeSettingsPanel}
        onClick={onClose}
        iconColor={colors.textSecondary}
        iconColorOnHover={'#000'}
      />
      {selectedNode.title && (
        <Title variant="h2" mt="-4px" mb="32px">
          <FormattedMessage {...selectedNode.title} />
        </Title>
      )}
      {selectedNode.settings && React.createElement(selectedNode.settings)}
      {selectedNode.isDeletable && !selectedNode.custom?.noDelete ? (
        <Box display="flex">
          <Button
            id="e2e-delete-button"
            icon="delete"
            buttonStyle="primary-outlined"
            borderColor={colors.error}
            textColor={colors.error}
            iconColor={colors.error}
            onClick={onDelete}
          >
            <FormattedMessage {...messages.delete} />
          </Button>
        </Box>
      ) : null}
    </StyledBox>
  );
};

export default Settings;
