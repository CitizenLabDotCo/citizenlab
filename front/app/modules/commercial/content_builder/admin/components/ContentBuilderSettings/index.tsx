import React from 'react';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// craft
import { useEditor } from '@craftjs/core';
import { ROOT_NODE } from '@craftjs/utils';

// intl
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

const StyledBox = styled(Box)`
  box-shadow: -2px 0px 1px 0px rgba(0, 0, 0, 0.06);
`;

const ContentBuilderSettings = () => {
  const { actions, selected, isEnabled } = useEditor((state, query) => {
    const currentNodeId: string = query.getEvent('selected').last();
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings:
          state.nodes[currentNodeId].related &&
          state.nodes[currentNodeId].related.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
      };
    }

    return {
      selected,
      isEnabled: state.options.enabled,
    };
  });

  const getComponentNameMessage = (name: 'Container') => {
    switch (name) {
      case 'Container':
        return messages.oneColumn;
    }
  };

  return selected && isEnabled && selected.id !== ROOT_NODE ? (
    <StyledBox bgColor={colors.adminDarkBackground} p="20px" w="400px">
      <Box pb="20px">
        <h2>
          <FormattedMessage {...getComponentNameMessage(selected.name)} />
        </h2>
      </Box>
      {selected.settings && React.createElement(selected.settings)}
      {selected.isDeletable ? (
        <Button
          icon="delete"
          buttonStyle="primary-outlined"
          borderColor={colors.clRed}
          textColor={colors.clRed}
          iconColor={colors.clRed}
          onClick={() => {
            actions.delete(selected.id);
          }}
        >
          <FormattedMessage {...messages.delete} />
        </Button>
      ) : null}
    </StyledBox>
  ) : null;
};

export default ContentBuilderSettings;
