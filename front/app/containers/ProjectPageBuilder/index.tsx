import React from 'react';
import { Editor, Frame, useNode, useEditor, Element } from '@craftjs/core';
import {
  Box,
  Input,
  Button as ClButton,
  Select,
} from '@citizenlab/cl2-component-library';

import ProjectCard from 'components/ProjectCard';

const Project = ({ size }) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  return (
    <Box ref={(ref: any) => connect(drag(ref))}>
      <Box style={{ pointerEvents: 'none' }}>
        <ProjectCard
          projectId="d738f014-122c-4120-8fd8-ece96e27ebe3"
          size={size}
          layout="twocolumns"
        />
      </Box>
    </Box>
  );
};

const ProjectSettings = () => {
  const {
    actions: { setProp },
    size,
  } = useNode((node) => ({
    size: node.data.props.size,
  }));

  return (
    <div>
      <Select
        value={size}
        options={[
          { label: 'small', value: 'small' },
          { label: 'medium', value: 'medium' },
          { label: 'large', value: 'large' },
        ]}
        onChange={(option) => {
          setProp((props) => (props.size = option.value));
        }}
      />
    </div>
  );
};

Project.craft = {
  props: {
    size: 'medium',
  },
  related: {
    settings: ProjectSettings,
  },
};

const Text = ({ text, fontSize }) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  return (
    <div ref={(ref: any) => connect(drag(ref))}>
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

const Button = ({ text, buttonStyle }) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  return (
    <Box ref={(ref: any) => connect(drag(ref))}>
      <Box style={{ pointerEvents: 'none' }}>
        <ClButton width="auto" locale="en" buttonStyle={buttonStyle}>
          {text}
        </ClButton>
      </Box>
    </Box>
  );
};

const ButtonSettings = () => {
  const {
    actions: { setProp },
    buttonStyle,
    text,
  } = useNode((node) => ({
    buttonStyle: node.data.props.buttonStyle,
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
      <Select
        value={buttonStyle}
        options={[
          { label: 'primary', value: 'primary' },
          { label: 'primary-outlined', value: 'primary-outlined' },
        ]}
        onChange={(option) => {
          setProp((props) => (props.buttonStyle = option.value));
        }}
      />
    </div>
  );
};

Button.craft = {
  props: {
    text: 'Button',
    buttonStyle: 'primary',
  },
  related: {
    settings: ButtonSettings,
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
            ref={(ref: any) =>
              connectors.create(ref, <Text text="Hi world" fontSize="20px" />)
            }
          >
            Text
          </button>
        </Box>
        <Box>
          <button
            ref={(ref: any) =>
              connectors.create(
                ref,
                <Button text="Button" buttonStyle="primary" />
              )
            }
          >
            Button
          </button>
        </Box>
        <Box>
          <button
            ref={(ref: any) =>
              connectors.create(ref, <Project size="medium" />)
            }
          >
            Project
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

  return selected && isEnabled ? (
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
    <Editor resolver={{ Text, Box, Button, Project }}>
      <Box p="10px">
        <h5>A super simple page editor</h5>
        <Box display="flex" width="100%">
          <Box width="80%">
            <Frame>
              <Element canvas is={Box} padding={5} data-cy="root-container">
                <Text fontSize="20px" text="Hi world!" />
                <Text fontSize="20px" text="It's me again!" />
                <Button buttonStyle="primary" text="Button Here" />
              </Element>
            </Frame>
          </Box>
          <Box width="20%">
            <Toolbox />
            <SettingsPanel />
          </Box>
        </Box>
      </Box>
    </Editor>
  );
}
