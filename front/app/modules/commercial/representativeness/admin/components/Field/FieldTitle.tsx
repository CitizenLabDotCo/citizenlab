import React from 'react';
import Tippy from '@tippyjs/react';

// hooks
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Toggle, Title, Text } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { Multiloc } from 'typings';

const TooltipContent = styled.p`
  color: white;
  margin: 12px 16px;
  font-size: 14px;
  font-weight: 500px;
`;

interface Props {
  enabled: boolean;
  titleMultiloc: Multiloc;
  isDefault: boolean;
  onToggleEnabled: (event: React.FormEvent) => void;
}

const FieldTitle = ({
  enabled,
  titleMultiloc,
  isDefault,
  onToggleEnabled,
}: Props) => {
  const localize = useLocalize();

  const handleToggle = (event: React.FormEvent) => {
    event.stopPropagation();
    onToggleEnabled(event);
  };

  return (
    <Box
      py="20px"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
    >
      <Box display="flex" alignItems="center">
        <Tippy
          placement="top"
          content={
            <TooltipContent>
              {enabled ? (
                <FormattedMessage {...messages.shownOnDashboard} />
              ) : (
                <FormattedMessage {...messages.hiddenOnDashboard} />
              )}
            </TooltipContent>
          }
        >
          <Box display="flex" alignItems="center">
            <Toggle checked={enabled} onChange={handleToggle} />
          </Box>
        </Tippy>
        <Title variant="h4" as="h3" mt="0px" mb="0px" ml="12px">
          {localize(titleMultiloc)}
        </Title>
      </Box>

      {isDefault && (
        <Text mt="0px" mb="0px" variant="bodyS" color="adminTextColor">
          <FormattedMessage {...messages.defaultField} />
        </Text>
      )}
    </Box>
  );
};

export default FieldTitle;
