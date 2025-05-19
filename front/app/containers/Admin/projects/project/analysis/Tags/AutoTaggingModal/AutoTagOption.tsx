import React, { ReactNode } from 'react';

import {
  Box,
  Title,
  Text,
  colors,
  Spinner,
  IconTooltip,
  Icon,
  stylingConsts,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { TagType } from 'api/analysis_tags/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import Tag from '../Tag';

const AutoTagMethodContainer = styled.div<{ isDisabled: boolean }>`
  background-color: ${colors.grey100};
  border-radius: 3px;
  padding: 16px;
  ${({ isDisabled }) =>
    isDisabled
      ? `opacity: 0.5;
         cursor: not-allowed;`
      : `
      cursor: pointer;
      &:hover {
        border: 1px black;
        box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
          rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
      }`}
`;

interface Props {
  children: ReactNode;
  tagType: TagType;
  title: string;
  onSelect: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  tooltip?: string;
  isRecommended?: boolean;
}

const AutoTagOption = ({
  children,
  tagType,
  title,
  onSelect,
  isDisabled,
  isLoading,
  tooltip,
  isRecommended,
}: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Box w="30%" bgColor={colors.grey100}>
      <Tooltip
        content={
          <p>{formatMessage(messages.advancedAutotaggingUpsellMessage)}</p>
        }
        zIndex={9999999}
        disabled={!isDisabled}
      >
        <AutoTagMethodContainer
          onClick={isDisabled || isLoading ? undefined : () => onSelect()}
          isDisabled={isDisabled || isLoading}
          tabIndex={0}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb="8px"
          >
            <Box w="32px">
              <Tag tagType={tagType} name="&nbsp;" />
            </Box>
            {isRecommended && (
              <Box
                bgColor={colors.success}
                py="4px"
                px="8px"
                borderRadius={stylingConsts.borderRadius}
                display="flex"
                gap="4px"
                alignItems="center"
              >
                <Icon
                  name="stars"
                  fill={colors.white}
                  width="16px"
                  height="16px"
                />
                <Text color="white" m="0px" fontSize="s">
                  {formatMessage(messages.recommended)}
                </Text>
              </Box>
            )}
            {isDisabled && <Icon name="lock" />}
          </Box>
          <Box
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
            gap="6px"
          >
            <Title variant="h6" m="0px">
              {title}
            </Title>
            {isLoading && (
              <Box mx="16px">
                <Spinner size="24px" />
              </Box>
            )}
            {tooltip && <IconTooltip content={tooltip} icon="info-outline" />}
          </Box>
          <Text mt="12px" mb="0px">
            {children}
          </Text>
        </AutoTagMethodContainer>
      </Tooltip>
    </Box>
  );
};

export default AutoTagOption;
