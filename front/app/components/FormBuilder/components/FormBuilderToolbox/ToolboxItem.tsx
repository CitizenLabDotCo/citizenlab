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

import { Drag } from '../DragAndDrop';
import messages from '../messages';

interface Props {
  label: string;
  icon: IconNames;
  'data-cy'?: string;
  fieldsToInclude?: ICustomFieldInputType[];
  inputType?: ICustomFieldInputType;
  disabled?: boolean;
  disabledTooltipMessage?: MessageDescriptor;
  showAIUpsell?: boolean;
  // Drag-related props
  dragId: string;
  dragIndex?: number;
}

const StyledBox = styled(Box)<{ disabled: boolean }>`
  text-align: left;
  &:hover {
    background-color: ${({ disabled }) =>
      disabled ? 'white' : colors.grey200};
    transition: background-color 80ms ease-out 0s;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'grab')};
  }
`;

const ToolboxItem = ({
  icon,
  label,
  fieldsToInclude,
  inputType,
  disabled,
  disabledTooltipMessage,
  showAIUpsell,
  dragId,
  dragIndex = 0,
  ...rest
}: Props) => {
  const { formatMessage } = useIntl();

  if (fieldsToInclude && inputType && !fieldsToInclude.includes(inputType)) {
    return null;
  }

  return (
    <Drag
      id={dragId}
      index={dragIndex}
      useBorder={false}
      isDragDisabled={disabled}
      keepElementsWhileDragging={true}
    >
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
        <Box minWidth={!disabled ? '100%' : 'auto'} p="0px">
          <StyledBox
            display="flex"
            p="18px"
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
          </StyledBox>
        </Box>
      </Tooltip>
    </Drag>
  );
};

export default ToolboxItem;
