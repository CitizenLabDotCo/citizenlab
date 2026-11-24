import React, { useState } from 'react';

import Modal from 'design-system/Modal';
import Spinner from 'design-system/Spinner';
import Text from 'design-system/Text';

import useIdeas from 'api/ideas/useIdeas';
import usePhase from 'api/phases/usePhase';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import PhaseSelect from '../PhaseSelect';
import { LinkedIdea } from '../useStagedInputs';

import messages from './messages';
import styles from './VotingOptionsSection.module.css';

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
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      size={560}
      title={formatMessage(messages.importFromPreviousPhase)}
      secondaryAction={{
        label: formatMessage(messages.linkCancel),
        onPress: onClose,
      }}
      primaryAction={{
        label: formatMessage(messages.linkInputs),
        isDisabled: !ideas?.length,
        onPress: link,
      }}
    >
      <div className={styles.body}>
        <Text variant="ui" tone="secondary">
          {formatMessage(messages.linkPhaseDescription)}
        </Text>
        <PhaseSelect
          label={formatMessage(messages.linkPhaseLabel)}
          projectId={projectId}
          phaseId={fromPhaseId}
          participationMethods={['ideation', 'voting', 'proposals']}
          filterPhases={(phases) =>
            phases.filter(
              ({ id, attributes }) =>
                id !== phaseId && !!startAt && attributes.start_at < startAt
            )
          }
          onChange={setFromPhaseId}
        />
        {loading && <Spinner />}
        {ideas && (
          <Text variant="ui" tone="secondary">
            {formatMessage(messages.nInputsToLink, { count: ideas.length })}
          </Text>
        )}
      </div>
    </Modal>
  );
};

export default LinkPhaseIdeasModal;
