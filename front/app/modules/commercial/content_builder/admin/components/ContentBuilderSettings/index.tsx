import React from 'react';
import { useEditor } from '@craftjs/core';
import { Box } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';
import Button from 'components/UI/Button';

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

  return selected && isEnabled && selected.id !== 'ROOT' ? (
    <Box
      bgColor={colors.disabledPrimaryButtonBg}
      px="20px"
      py="20px"
      minWidth="210px"
    >
      <Box>
        <Box>
          <Box pb={'20px'}>
            <Box>
              <Box>
                <h2>{selected.name}</h2>
              </Box>
            </Box>
          </Box>
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
            Delete
          </Button>
        ) : null}
      </Box>
    </Box>
  ) : null;
};

export default ContentBuilderSettings;
