import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  Badge,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ICustomFieldInputType } from 'api/custom_fields/types';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  label: string;
  icon: IconNames;
  onClick: () => void;
  'data-cy'?: string;
  fieldsToExclude?: ICustomFieldInputType[];
  inputType?: ICustomFieldInputType;
  disabled?: boolean;
  disabledTooltipMessage?: MessageDescriptor;
  showAIUpsell?: boolean;
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
  disabledTooltipMessage,
  showAIUpsell,
  ...rest
}: Props) => {
  const { formatMessage } = useIntl();

  if (fieldsToExclude && inputType && fieldsToExclude.includes(inputType)) {
    return null;
  }

  return (
    <Tooltip
      placement={'left-start'}
      disabled={!disabled || !disabledTooltipMessage}
      theme={'dark'}
      content={
        disabledTooltipMessage && (
          <Box style={{ cursor: 'default' }}>
            <Text my="8px" color="white" fontSize="s">
              {formatMessage(disabledTooltipMessage)}
            </Text>
          </Box>
        )
      }
    >
      <Box
        as="button"
        minWidth={!disabled ? '100%' : 'auto'}
        p="0px"
        type="button"
        role="button"
      >
        <StyledBox
          display="flex"
          p="18px"
          onClick={disabled ? () => {} : onClick}
          width="100%"
          m="0px"
          alignItems="center"
          data-cy={rest['data-cy']}
          disabled={!!disabled}
        >
          <Icon
            fill={disabled ? colors.disabled : colors.primary}
            width="20px"
            height="20px"
            name={icon}
          />
          <Text
            fontSize="s"
            ml="12px"
            my="0"
            color={disabled ? 'disabled' : 'textPrimary'}
          >
            {label}
          </Text>
          {showAIUpsell && (
            <Tooltip
              placement="bottom"
              theme={'dark'}
              content={
                <Box style={{ cursor: 'default' }}>
                  <Text my="8px" color="white" fontSize="s">
                    {formatMessage(messages.aiUpsellText)}
                  </Text>
                </Box>
              }
            >
              <Box mx="6px" w="6px">
                <Badge
                  color={colors.teal}
                  className="inverse"
                  style={{ padding: '1px 6px' }}
                >
                  {formatMessage(messages.ai)}
                </Badge>
              </Box>
            </Tooltip>
          )}
          {!disabled && <AddIcon />}
        </StyledBox>
      </Box>
    </Tooltip>
  );
};

export default ToolboxItem;
