import React from 'react';
import { Editor, Frame, useNode, useEditor, Element } from '@craftjs/core';
import { Box, Input } from '@citizenlab/cl2-component-library';

export const Text = ({ text, fontSize }) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  return (
    <div ref={(ref) => connect(drag(ref))}>
      <p style={{ fontSize }}>{text}</p>
    </div>
  );
};

const TextSettings = () => {
  const {
    actions: { setProp },
    fontSize,
    text,
  } = useNode((node) => ({
    fontSize: node.data.props.fontSize,
    text: node.data.props.text,
  }));

  return (
    <div>
      <Input
        type="text"
        label="text"
        value={text}
        onChange={(value) => {
          setProp((props) => (props.text = value));
        }}
      />
      <Input
        type="text"
        label="font size"
        value={fontSize}
        onChange={(value) => {
          setProp((props) => (props.fontSize = value));
        }}
      />
    </div>
  );
};

Text.craft = {
  props: {
    text: 'Hi',
    fontSize: 20,
  },
  related: {
    settings: TextSettings,
  },
};

const Toolbox = () => {
  const { connectors } = useEditor();
  return (
    <Box px={'20px'} py={'20px'}>
      <Box>
        <Box pb={'20px'}>
          <h2>Drag to add</h2>
        </Box>
        <Box>
          <button
            ref={(ref) =>
              connectors.create(ref, <Text text="Hi world" fontSize="20px" />)
            }
          >
            Text
          </button>
        </Box>
      </Box>
    </Box>
  );
};

const SettingsPanel = () => {
  const { actions, selected, isEnabled } = useEditor((state, query) => {
    const currentNodeId = query.getEvent('selected').last();
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

  console.log(isEnabled);
  console.log(selected);
  return selected ? (
    <Box bgColor="rgba(0, 0, 0, 0.06)" mt={'20px'} px={'20px'} py={'20px'}>
      <Box>
        <Box>
          <Box pb={'20px'}>
            <Box>
              <Box>
                <h2>Selected</h2>
              </Box>
              <Box>
                <Box color="primary">{selected.name}</Box>
              </Box>
            </Box>
          </Box>
        </Box>
        {selected.settings && React.createElement(selected.settings)}
        {selected.isDeletable ? (
          <button
            color="default"
            onClick={() => {
              actions.delete(selected.id);
            }}
          >
            Delete
          </button>
        ) : null}
      </Box>
    </Box>
  ) : null;
};

export default function ProjectPageBuilder() {
  return (
    <Editor resolver={{ Text, Box }}>
      <div>
        <h5>A super simple page editor</h5>
        <Box>
          <Box border="1px solid red">
            <Frame>
              <Element
                canvas
                is={Box}
                padding={5}
                background="#eeeeee"
                data-cy="root-container"
              >
                <Text fontSize="20px" text="Hi world!" />
                <Text fontSize="20px" text="It's me again!" />
              </Element>
            </Frame>
          </Box>
          <Box>
            <Toolbox />
            <SettingsPanel />
          </Box>
        </Box>
      </div>
    </Editor>
  );
}
