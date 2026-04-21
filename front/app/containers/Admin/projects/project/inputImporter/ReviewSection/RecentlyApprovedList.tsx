import React from 'react';

import {
  Box,
  CollapsibleContainer,
  Text,
  IconButton,
  Spinner,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';
import { truncate } from 'utils/textUtils';

import messages from './messages';

export interface ApprovedIdea {
  id: string;
  title: string;
}

interface Props {
  ideas: ApprovedIdea[];
  onUndo: (id: string) => void;
  undoingId: string | null;
}

// Drive overflow from the CollapsibleContainer's aria-expanded so the
// scrollbar disappears the instant the user clicks to collapse, instead of
// waiting for CollapsibleContainer's 1500ms unmount timeout.
const StickyWrapper = styled(Box)`
  overflow: hidden;
  &:has(button[aria-expanded='true']) {
    overflow-y: auto;
  }
`;

const RecentlyApprovedList = ({ ideas, onUndo, undoingId }: Props) => {
  const { formatMessage } = useIntl();

  if (ideas.length === 0) return null;

  return (
    <StickyWrapper
      position="sticky"
      bottom="0"
      bgColor={colors.white}
      borderTop={`1px ${colors.grey400} solid`}
      mt="12px"
      py="8px"
      maxHeight="50%"
    >
      <CollapsibleContainer
        titleAs="h3"
        titleVariant="h5"
        titleFontSize="s"
        title={formatMessage(messages.recentlyApprovedTitle, {
          count: ideas.length,
        })}
      >
        <Box>
          {ideas.map((idea) => (
            <Box
              key={idea.id}
              py="8px"
              borderBottom={`1px ${colors.grey400} solid`}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap="8px"
            >
              <Text m="0" color="black" fontSize="s">
                {idea.title
                  ? truncate(idea.title, 80)
                  : formatMessage(messages.noTitleInputLabel)}
              </Text>
              {undoingId === idea.id ? (
                <Box
                  py="3px"
                  px="6px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Spinner size="20px" />
                </Box>
              ) : (
                <IconButton
                  iconName="undo"
                  iconColor={colors.primary}
                  iconColorOnHover={colors.black}
                  onClick={() => onUndo(idea.id)}
                  a11y_buttonActionMessage={formatMessage(
                    messages.undoApproval
                  )}
                />
              )}
            </Box>
          ))}
        </Box>
      </CollapsibleContainer>
    </StickyWrapper>
  );
};

export default RecentlyApprovedList;
