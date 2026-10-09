import React from 'react';

import {
  Box,
  Text,
  Button,
  IconNames,
  colors,
  Spinner,
} from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';
import styled from 'styled-components';

import { IIdeaData } from 'api/ideas/types';
import useImportedIdeaMetadata from 'api/import_ideas/useImportedIdeaMetadata';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const StyledButton = styled(Button)``;

// The action button keeps its slot when hidden (visibility, not display), so
// hovering never shifts the layout and the title never runs under the button.
const StyledBox = styled(Box)`
  ${StyledButton} {
    visibility: hidden;
  }

  &:hover {
    background-color: ${colors.teal50};

    ${StyledButton} {
      visibility: visible;
    }
  }
`;

const TruncatedText = styled(Text)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

interface Props {
  idea: IIdeaData;
  ideaNumber: number;
  selected: boolean;
  actionIcon: IconNames;
  actionInProgress: boolean;
  onSelect: (ideaId: string) => void;
  onAction: (ideaId: string) => void;
}

// One row of the importer's input lists. The pending and approved lists share
// it; only the hover action differs (delete vs undo approval).
const ImportedInputRow = ({
  idea,
  ideaNumber,
  selected,
  actionIcon,
  actionInProgress,
  onSelect,
  onAction,
}: Props) => {
  const { formatMessage } = useIntl();

  const { data: ideaMetadata } = useImportedIdeaMetadata({
    id: idea.relationships.idea_import?.data?.id,
  });

  if (!ideaMetadata) return null;

  const { locale } = ideaMetadata.data.attributes;
  const title = idea.attributes.title_multiloc[locale];

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAction(idea.id);
  };

  return (
    <StyledBox
      py="8px"
      borderBottom={`1px ${colors.grey400} solid`}
      style={{ cursor: 'pointer' }}
      bgColor={selected ? colors.teal50 : undefined}
      display="flex"
      alignItems="center"
      gap="4px"
      onClick={() => {
        onSelect(idea.id);
      }}
    >
      <Box flex="1" minWidth="0">
        <TruncatedText
          m="0"
          color="black"
          fontSize="m"
          fontWeight={selected ? 'bold' : 'normal'}
        >
          {title ||
            `${formatMessage(messages.noTitleInputLabel)} ${ideaNumber}`}
        </TruncatedText>
        <Text m="0" mt="3px" fontSize="s" color="grey600">
          {format(new Date(idea.attributes.created_at), 'yyyy-MM-dd HH:mm:ss')}
        </Text>
      </Box>

      <Box
        flexShrink={0}
        w="28px"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        {actionInProgress ? (
          <Spinner size="15px" />
        ) : (
          <StyledButton
            icon={actionIcon}
            iconSize="12px"
            padding="2px"
            borderRadius="10px"
            marginRight="8px"
            bgColor={colors.teal200}
            onClick={handleAction}
          />
        )}
      </Box>
    </StyledBox>
  );
};

export default ImportedInputRow;
