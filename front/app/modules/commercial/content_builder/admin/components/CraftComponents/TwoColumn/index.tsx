import React from 'react';

// components
import {
  Box,
  Radio,
  Label,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

// craft
import { useNode, UserComponent, Element } from '@craftjs/core';
import Container from '../Container';

// Intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../messages';

const TwoColumn: UserComponent = ({ columnLayout }) => {
  const isLargeTablet = useBreakpoint('largeTablet');
  const {
    connectors: { drag, connect },
  } = useNode();

  return (
    <Box
      ref={(ref) => ref && connect(drag(ref))}
      flexDirection={isLargeTablet ? 'column' : 'row'}
      minHeight="40px"
      display="flex"
      w="100%"
      gap="4px"
    >
      <Box
        flex={columnLayout == '1-1' ? '1' : columnLayout == '1-2' ? '1' : '2'}
      >
        <Element id="column1" is={Container} canvas />
      </Box>
      <Box
        flex={columnLayout == '1-1' ? '1' : columnLayout == '1-2' ? '2' : '1'}
      >
        <Element id="column2" is={Container} canvas />
      </Box>
    </Box>
  );
};

const TwoColumnSettings = () => {
  const {
    actions: { setProp },
    columnLayout,
  } = useNode((node) => ({
    columnLayout: node.data.props.columnLayout,
  }));

  return (
    <Box marginTop="-20px" marginBottom="30px">
      <Label>
        <FormattedMessage {...messages.columnLayoutRadioLabel} />
      </Label>
      <Radio
        onChange={(value) => {
          setProp((props) => (props.columnLayout = value));
        }}
        id="layout-1-1"
        name="columnLayout"
        value={'1-1'}
        label={'1-1'}
        isRequired
        currentValue={columnLayout}
      />
      <Radio
        onChange={(value) => {
          setProp((props) => (props.columnLayout = value));
        }}
        currentValue={columnLayout}
        id="layout-2-1"
        name="columnLayout"
        value="2-1"
        label={'2-1'}
        isRequired
      />
      <Radio
        onChange={(value) => {
          setProp((props) => (props.columnLayout = value));
        }}
        currentValue={columnLayout}
        id="layout-1-2"
        name="columnLayout"
        value="1-2"
        label={'1-2'}
        isRequired
      />
    </Box>
  );
};

TwoColumn.craft = {
  props: {
    columnLayout: '',
  },
  related: {
    settings: TwoColumnSettings,
  },
};

export default TwoColumn;
