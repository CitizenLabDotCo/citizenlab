import React from 'react';

// components
import {
  Box,
  Radio,
  Title,
  useBreakpoint,
  Icon,
} from '@citizenlab/cl2-component-library';

// utils
import { colors } from 'utils/styleUtils';

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
      gap="8px"
    >
      <Box flex={columnLayout === '2-1' ? '2' : '1'}>
        <Element id="column1" is={Container} canvas />
      </Box>
      <Box flex={columnLayout === '1-2' ? '2' : '1'}>
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
    <Box mb="30px">
      <Title variant="h4" as="h3">
        <FormattedMessage {...messages.columnLayoutRadioLabel} />
      </Title>
      <Radio
        onChange={(value) => {
          setProp((props) => (props.columnLayout = value));
        }}
        id="layout-1-1"
        name="columnLayout"
        value={'1-1'}
        label={
          <Icon
            title={<FormattedMessage {...messages.twoEvenColumn} />}
            ariaHidden={false}
            width="20px"
            height="20px"
            fill={colors.adminTextColor}
            name="column2"
          />
        }
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
        label={
          <Icon
            title={<FormattedMessage {...messages.twoColumnVariant2and1} />}
            ariaHidden={false}
            width="20px"
            height="20px"
            fill={colors.adminTextColor}
            name="column2Variant2-1"
          />
        }
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
        label={
          <Icon
            title={<FormattedMessage {...messages.twoColumnVariant1and2} />}
            ariaHidden={false}
            width="20px"
            height="20px"
            fill={colors.adminTextColor}
            name="column2Variant1-2"
          />
        }
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
