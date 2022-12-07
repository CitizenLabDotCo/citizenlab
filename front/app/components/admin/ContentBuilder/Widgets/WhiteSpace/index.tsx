import React from 'react';

// components
import {
  Box,
  Radio,
  Title,
  Toggle,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import Divider from 'components/admin/Divider';

// craft
import { useNode } from '@craftjs/core';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  size?: 'small' | 'medium' | 'large';
  withDivider?: boolean;
}

const WhiteSpace = ({ size, withDivider }: Props) => {
  const isPhone = useBreakpoint('phone');

  const calculatePaddingY = () => {
    switch (size) {
      case 'small':
        return isPhone ? '8px' : '12px';
      case 'medium':
        return isPhone ? '16px' : '24px';
      case 'large':
        return isPhone ? '24px' : '36px';
      default:
        return isPhone ? '8px' : '12px';
    }
  };
  return (
    <Box id="e2e-white-space" w="100%" paddingY={calculatePaddingY()}>
      {withDivider && <Divider m="0" />}
    </Box>
  );
};

const WhiteSpaceSettings = () => {
  const {
    actions: { setProp },
    size,
    withDivider,
  } = useNode((node) => ({
    size: node.data.props.size,
    withDivider: node.data.props.withDivider,
  }));

  return (
    <Box mb="30px">
      <Title variant="h4" as="h3">
        <FormattedMessage {...messages.whiteSpaceRadioLabel} />
      </Title>
      <Radio
        onChange={(value) => {
          setProp((props) => (props.size = value));
        }}
        currentValue={size}
        id="white-space-small"
        name="size"
        value="small"
        label={<FormattedMessage {...messages.whiteSpaceRadioSmall} />}
        isRequired
      />
      <Radio
        onChange={(value) => {
          setProp((props) => (props.size = value));
        }}
        currentValue={size}
        id="white-space-medium"
        name="size"
        value="medium"
        label={<FormattedMessage {...messages.whiteSpaceRadioMedium} />}
        isRequired
      />
      <Radio
        onChange={(value) => {
          setProp((props) => (props.size = value));
        }}
        currentValue={size}
        id="white-space-large"
        name="size"
        value="large"
        label={<FormattedMessage {...messages.whiteSpaceRadioLarge} />}
        isRequired
      />
      <Box mt="40px">
        <Toggle
          onChange={() => {
            setProp((props) => (props.withDivider = !props.withDivider));
          }}
          checked={withDivider}
          id="e2e-white-space-divider-toggle"
          label={<FormattedMessage {...messages.whiteSpaceDividerLabel} />}
        />
      </Box>
    </Box>
  );
};

WhiteSpace.craft = {
  props: {
    size: '',
  },
  related: {
    settings: WhiteSpaceSettings,
  },
  custom: {
    title: messages.whiteSpace,
  },
};

export default WhiteSpace;
