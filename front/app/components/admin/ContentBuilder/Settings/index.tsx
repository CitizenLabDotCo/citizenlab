import React from 'react';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import { Title, Box, stylingConsts } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import CloseIconButton from 'components/UI/CloseIconButton';

// craft
import { useEditor, ROOT_NODE } from '@craftjs/core';

// intl
import messages from '../messages';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

// events
import eventEmitter from 'utils/eventEmitter';
import { CONTENT_BUILDER_DELETE_ELEMENT_EVENT } from 'components/admin/ContentBuilder/constants';

const StyledBox = styled(Box)`
  box-shadow: -2px 0px 1px 0px rgba(0, 0, 0, 0.06);
`;

const StyledCloseIconButton = styled(CloseIconButton)`
  position: absolute;
  right: 8px;
`;

interface Selected {
  id: string;
  name: string;
  title: MessageDescriptor | undefined;
  settings: React.ElementType<any> | undefined;
  isDeletable: boolean;
}

const ContentBuilderSettings = () => {
  const { actions, selected, isEnabled } = useEditor((state, query) => {
    const currentNodeId: string = query.getEvent('selected').last();
    let selected: Selected | undefined;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        title: state.nodes[currentNodeId].data.custom?.title as
          | MessageDescriptor
          | undefined,
        settings: state.nodes[currentNodeId].related?.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
      };
    }

    return {
      selected,
      isEnabled: state.options.enabled,
    };
  });

  const closeSettings = () => {
    actions.selectNode();
  };

  return selected &&
    isEnabled &&
    selected.id !== ROOT_NODE &&
    selected.name !== 'Box' ? (
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
        className="e2eBuilderSettingsClose"
        a11y_buttonActionMessage={messages.a11y_closeSettingsPanel}
        onClick={closeSettings}
        iconColor={colors.textSecondary}
        iconColorOnHover={'#000'}
      />
      {selected.title && (
        <Title variant="h2">
          <FormattedMessage {...selected.title} />
        </Title>
      )}
      {selected.settings && React.createElement(selected.settings)}
      {selected.isDeletable ? (
        <Box display="flex">
          <Button
            id="e2e-delete-button"
            icon="delete"
            buttonStyle="primary-outlined"
            borderColor={colors.error}
            textColor={colors.error}
            iconColor={colors.error}
            onClick={() => {
              actions.delete(selected.id);
              eventEmitter.emit(
                CONTENT_BUILDER_DELETE_ELEMENT_EVENT,
                selected.id
              );
            }}
          >
            <FormattedMessage {...messages.delete} />
          </Button>
        </Box>
      ) : null}
    </StyledBox>
  ) : null;
};

export default ContentBuilderSettings;
