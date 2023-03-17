import {
  Box,
  Icon,
  Text,
  Title,
  IconNames,
  colors,
} from '@citizenlab/cl2-component-library';
import React from 'react';
import { MessageDescriptor } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';

type PermissionCardButtonProps = {
  onClick: () => void;
  selected: boolean;
  iconName: IconNames;
  title: MessageDescriptor;
  subtitle: MessageDescriptor;
};
export const PermissionCardButton = ({
  onClick,
  selected,
  iconName,
  title,
  subtitle,
}: PermissionCardButtonProps) => {
  return (
    <Box
      width="240px"
      minHeight="210px"
      background={selected ? colors.tealLight : colors.white}
      onClick={onClick}
      padding="16px"
      border={
        selected ? `solid 1px ${colors.primary}` : `solid 1px ${colors.grey300}`
      }
      style={{ cursor: 'pointer' }}
    >
      {' '}
      <Icon
        width="28px"
        height="28px"
        name={iconName}
        fill={selected ? colors.teal200 : colors.grey300}
      />
      <Title variant="h5" color={selected ? 'primary' : 'coolGrey500'}>
        <FormattedMessage {...title} />
      </Title>
      <Text fontSize="xs" color={selected ? 'primary' : 'coolGrey500'}>
        <FormattedMessage {...subtitle} />
      </Text>
    </Box>
  );
};
