import React from 'react';

import {
  Box,
  Radio,
  Label,
  Toggle,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import Divider from 'components/admin/Divider';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

export interface Props {
  size?: 'small' | 'medium' | 'large';
  withDivider?: boolean;
}

const WhiteSpace = ({ size, withDivider }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  const calculatePaddingY = () => {
    switch (size) {
      case 'small':
        return isSmallerThanPhone ? '8px' : '12px';
      case 'medium':
        return isSmallerThanPhone ? '16px' : '24px';
      case 'large':
        return isSmallerThanPhone ? '24px' : '36px';
      default:
        return isSmallerThanPhone ? '8px' : '12px';
    }
  };
  return (
    <Box className="e2e-white-space" w="100%" paddingY={calculatePaddingY()}>
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
      <Label>
        <FormattedMessage {...messages.whiteSpaceRadioLabel} />
      </Label>
      <Radio
        onChange={(value) => {
          setProp((props: Props) => (props.size = value));
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
          setProp((props: Props) => (props.size = value));
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
          setProp((props: Props) => (props.size = value));
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
            setProp((props: Props) => (props.withDivider = !props.withDivider));
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

export const whiteSpaceTitle = messages.whiteSpace;

export default WhiteSpace;
