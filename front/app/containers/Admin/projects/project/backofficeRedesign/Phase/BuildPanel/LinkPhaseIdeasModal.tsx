import React, { useState } from 'react';

import { Box, Button, Spinner, Text } from '@citizenlab/cl2-component-library';

import useIdeas from 'api/ideas/useIdeas';
import usePhase from 'api/phases/usePhase';

import Modal from 'components/UI/Modal';
import PhaseFilter from 'components/UI/PhaseFilter';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from '../../messages';

import { LinkedIdea } from './useStagedInputs';

interface Props {
  projectId: string;
  phaseId: string;
  onLink: (ideas: LinkedIdea[]) => void;
  onClose: () => void;
}

const LinkPhaseIdeasModal = ({
  projectId,
  phaseId,
  onLink,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();
  const [fromPhaseId, setFromPhaseId] = useState<string>();
  const { data: phase } = usePhase(phaseId);
  const startAt = phase?.data.attributes.start_at;

  const queryParams = { projects: [projectId], phase: fromPhaseId };
  const { data: firstPage } = useIdeas(
    { ...queryParams, 'page[size]': 1 },
    { enabled: !!fromPhaseId }
  );
  // The first page only gives the total, so all ideas load as one page.
  const total =
    firstPage &&
    (firstPage.data.length === 0
      ? 0
      : getPageNumberFromUrl(firstPage.links.last) ?? 0);
  const { data: allIdeas } = useIdeas(
    { ...queryParams, 'page[size]': total },
    { enabled: !!total }
  );

  const ideas: LinkedIdea[] | undefined =
    total === 0
      ? []
      : allIdeas?.data
          .map(({ id, relationships }) => ({
            id,
            phaseIds: relationships.phases.data.map((phase) => phase.id),
          }))
          .filter(({ phaseIds }) => !phaseIds.includes(phaseId));
  const loading = !!fromPhaseId && !ideas;

  const link = () => {
    if (!ideas) return;
    onLink(ideas);
    onClose();
  };

  return (
    <Modal
      opened
      close={onClose}
      width={560}
      variant="bo"
      header={formatMessage(messages.importFromPreviousPhase)}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" width="100%">
          <Button buttonStyle="bo-secondary" onClick={onClose}>
            {formatMessage(messages.linkCancel)}
          </Button>
          <Button
            buttonStyle="bo-primary"
            disabled={!ideas?.length}
            onClick={link}
          >
            {formatMessage(messages.linkInputs)}
          </Button>
        </Box>
      }
    >
      <Box p="24px" display="flex" flexDirection="column" gap="16px">
        <Text variant="boLabel" m="0">
          {formatMessage(messages.linkPhaseDescription)}
        </Text>
        <PhaseFilter
          label={formatMessage(messages.linkPhaseLabel)}
          projectId={projectId}
          phaseId={fromPhaseId}
          participationMethods={['ideation', 'voting', 'proposals']}
          customPhaseFilter={(phases) =>
            phases.filter(
              ({ id, attributes }) =>
                id !== phaseId && !!startAt && attributes.start_at < startAt
            )
          }
          onPhaseFilter={({ value }) => setFromPhaseId(value)}
          variant="bo"
        />
        {loading && <Spinner size="16px" />}
        {ideas && (
          <Text variant="boHelper" m="0">
            {formatMessage(messages.nInputsToLink, { count: ideas.length })}
          </Text>
        )}
      </Box>
    </Modal>
  );
};

export default LinkPhaseIdeasModal;
