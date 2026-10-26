import React, { FormEvent, ReactNode } from 'react';

import {
  Box,
  Button,
  Icon,
  IconTooltip,
  Text,
  Toggle,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import messages from 'containers/Admin/projects/project/messages';

import { useIntl } from 'utils/cl-intl';

// Links inside the description read as part of the text, as in the design.
const Description = styled.span`
  a {
    color: inherit;
    text-decoration: underline;
  }
`;

// The back-office toggle plus the gap before its label, so the text under
// the title lines up with it.
const TEXT_INDENT = '36px';

interface Props {
  title: string;
  description: ReactNode;
  enabled: boolean;
  alwaysEnabled?: boolean;
  isDefault: boolean;
  onToggle: (event: FormEvent) => void;
  onMakeDefault: () => void;
  /** Extra settings for the view, shown while it is on. */
  children?: ReactNode;
}

const ViewRow = ({
  title,
  description,
  enabled,
  alwaysEnabled,
  isDefault,
  onToggle,
  onMakeDefault,
  children,
}: Props) => {
  const { formatMessage } = useIntl();
  const titleText = (
    <Text as="span" variant="boControl" fontWeight="semi-bold" m="0">
      {title}
    </Text>
  );

  return (
    <Box display="flex" flexDirection="column" gap="4px" py="12px">
      {alwaysEnabled ? (
        <Box display="flex" alignItems="center" gap="4px">
          <Box width={TEXT_INDENT} display="flex">
            <Icon
              name="check"
              width="16px"
              height="16px"
              fill={colors.teal500}
            />
          </Box>
          {titleText}
          <IconTooltip
            content={formatMessage(messages.listViewCannotBeDisabled)}
          />
        </Box>
      ) : (
        <Toggle
          variant="bo"
          checked={enabled}
          onChange={onToggle}
          label={titleText}
        />
      )}
      <Box pl={TEXT_INDENT} display="flex" flexDirection="column" gap="8px">
        <Text as="span" variant="boHelper" m="0">
          <Description>{description}</Description>
        </Text>
        {enabled && isDefault && (
          <Box display="flex" alignItems="center" gap="6px">
            <Icon
              name="check"
              width="14px"
              height="14px"
              fill={colors.teal700}
            />
            <Text as="span" variant="boControl" color="teal700" m="0">
              {formatMessage(messages.defaultLabel)}
            </Text>
          </Box>
        )}
        {enabled && !isDefault && (
          <Box display="flex">
            <Button
              buttonStyle="bo-text"
              padding="0"
              height="auto"
              textColor={colors.teal700}
              onClick={onMakeDefault}
            >
              {formatMessage(messages.makeDefault)}
            </Button>
          </Box>
        )}
        {enabled && children}
      </Box>
    </Box>
  );
};

export default ViewRow;
