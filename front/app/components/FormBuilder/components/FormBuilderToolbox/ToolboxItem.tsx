import React from 'react';
import styled from 'styled-components';

// Components
import { Box, Icon, IconNames, Text } from '@citizenlab/cl2-component-library';

// utils
import { colors } from 'utils/styleUtils';

// services
import { ICustomFieldInputType } from 'services/formCustomFields';

interface Props {
  label: string;
  icon: IconNames;
  onClick: () => void;
  'data-cy'?: string;
  fieldsToExclude?: ICustomFieldInputType[];
  inputType?: ICustomFieldInputType;
  disabled?: boolean;
}

const AddIcon = styled(Icon).attrs({ name: 'plus' })`
  margin-left: auto;
  margin-right: 12px;
  fill: ${colors.textSecondary};
  margin-right: 0;
`;

const StyledBox = styled(Box)<{ disabled: boolean }>`
  text-align: left;
  ${AddIcon} {
    visibility: hidden;
  }
  &:hover {
    background-color: ${({ disabled }) =>
      disabled ? 'white' : colors.grey200};
    transition: background-color 80ms ease-out 0s;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  }
  &:hover ${AddIcon} {
    visibility: ${({ disabled }) => (disabled ? 'hidden' : 'visible')};
  }
`;

const ToolboxItem = ({
  icon,
  label,
  onClick,
  fieldsToExclude,
  inputType,
  disabled,
  ...rest
}: Props) => {
  if (fieldsToExclude && inputType && fieldsToExclude.includes(inputType)) {
    return null;
  }

  return (
    <StyledBox
      display="flex"
      px="18px"
      py="18px"
      onClick={onClick}
      width="100%"
      m="0px"
      alignItems="center"
      // remove the role attribute when we add drag and drop functionality
      role="button"
      data-cy={rest['data-cy']}
      disabled={!!disabled}
    >
      <Icon
        fill={disabled ? colors.coolGrey500 : colors.primary}
        width="20px"
        height="20px"
        name={icon}
      />
      <Text
        fontSize="s"
        ml="12px"
        my="0"
        color={disabled ? 'coolGrey500' : 'textPrimary'}
      >
        {label}
      </Text>
      <AddIcon />
    </StyledBox>
  );
};

export default ToolboxItem;
