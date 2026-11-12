import React from 'react';

import {
  Box,
  Image,
  Text,
  Title,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { DraftProject, changeElementId } from '../draft';
import messages from '../messages';

import ApprovalActions from './ApprovalActions';
import DraftItem from './DraftItem';
import ProposedChangeBadge from './ProposedChangeBadge';

const IMAGE_PLACEHOLDER = `linear-gradient(135deg, ${colors.teal100} 0%, ${colors.teal300} 100%)`;

type Props = {
  // Not there before the first message creates the draft.
  project?: DraftProject;
  conversationId?: string;
};

const ProjectSetupCard = ({ project, conversationId }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const change = project?.change;

  return (
    <DraftItem
      id={change && changeElementId(change.toolCall.id)}
      pending={!!change}
    >
      <Box p="24px" display="flex" gap="24px">
        <Box
          flex="0 0 220px"
          height="150px"
          overflow="hidden"
          borderRadius={bo.borderRadius}
          background={IMAGE_PLACEHOLDER}
        >
          {project?.headerImageUrl && (
            <Image
              src={project.headerImageUrl}
              alt=""
              width="100%"
              height="100%"
              objectFit="cover"
            />
          )}
        </Box>
        <Box
          flex="1"
          minWidth="0"
          display="flex"
          flexDirection="column"
          gap="8px"
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap="8px"
          >
            <Text m="0px" fontSize="s" color="textSecondary">
              {formatMessage(messages.cardLabel)}
            </Text>
            {change && <ProposedChangeBadge kind={change.kind} />}
          </Box>
          {project ? (
            <>
              <Title variant="h3" as="h3" m="0px">
                {localize(project.title)}
              </Title>
              <Text m="0px" color="textSecondary">
                {localize(project.descriptionPreview)}
              </Text>
            </>
          ) : (
            <Text m="0px" color="textSecondary">
              {formatMessage(messages.emptyDraft)}
            </Text>
          )}
          <ApprovalActions change={change} conversationId={conversationId} />
        </Box>
      </Box>
    </DraftItem>
  );
};

export default ProjectSetupCard;
