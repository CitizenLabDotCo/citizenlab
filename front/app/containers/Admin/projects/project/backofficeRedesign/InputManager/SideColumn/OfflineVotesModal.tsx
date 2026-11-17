import React, { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import Banner from 'design-system/Banner';
import Modal from 'design-system/Modal';
import NumberField from 'design-system/NumberField';
import Pagination from 'design-system/Pagination';
import Spinner from 'design-system/Spinner';

import useIdeas from 'api/ideas/useIdeas';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import phasesKeys from 'api/phases/keys';
import { IPhaseData } from 'api/phases/types';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from '../messages';

import styles from './SideColumn.module.css';
import 'design-system/tokens.css';

interface Props {
  phase: IPhaseData;
  onClose: () => void;
}

const OfflineVotesModal = ({ phase, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [voters, setVoters] = useState(
    phase.attributes.manual_voters_amount ?? 0
  );
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const { mutateAsync: updateIdea } = useUpdateIdea();
  const { mutateAsync: updatePhase } = useUpdatePhase();
  const { data: ideas } = useIdeas({
    projects: [phase.relationships.project.data.id],
    phase: phase.id,
    transitive: true,
    sort: 'title',
    'page[number]': page,
    'page[size]': 20,
  });
  const lastPage = ideas ? getPageNumberFromUrl(ideas.links.last) || 1 : 1;
  // A cleared field reports NaN.
  const invalid =
    Object.values(votes).some((value) => Number.isNaN(value)) ||
    Number.isNaN(voters);

  const save = async () => {
    setSaving(true);
    setFailed(false);
    try {
      if (phase.attributes.voting_method === 'budgeting') {
        await updatePhase({
          phaseId: phase.id,
          manual_voters_amount: voters,
        });
      }
      for (const [id, value] of Object.entries(votes)) {
        await updateIdea({
          id,
          requestBody: { manual_votes_amount: value },
        });
      }
      queryClient.invalidateQueries({ queryKey: phasesKeys.items() });
      queryClient.invalidateQueries({
        queryKey: phasesKeys.list({
          projectId: phase.relationships.project.data.id,
        }),
      });
      onClose();
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen && !saving) onClose();
      }}
      title={formatMessage(messages.addOfflineVotes)}
      primaryAction={{
        label: formatMessage(messages.saveOfflineVotes),
        onPress: save,
        isPending: saving,
        isDisabled: !ideas || ideas.data.length === 0 || invalid,
      }}
    >
      <p className={styles.modalHelp}>
        {formatMessage(messages.offlineVotesHelp)}
      </p>
      {phase.attributes.voting_method === 'budgeting' && (
        <div className={styles.participants}>
          <NumberField
            label={formatMessage(messages.offlineParticipants)}
            value={voters}
            minValue={0}
            step={1}
            onChange={setVoters}
            isDisabled={saving}
          />
        </div>
      )}
      {!ideas && (
        <div className={styles.loading}>
          <Spinner />
        </div>
      )}
      {ideas?.data.map((idea) => {
        const title = localize(idea.attributes.title_multiloc);
        const value =
          idea.id in votes
            ? votes[idea.id]
            : idea.attributes.manual_votes_amount ?? 0;

        return (
          <div key={idea.id} className={styles.voteRow}>
            <span className={styles.voteLabel}>{title}</span>
            <div className={styles.voteField}>
              <NumberField
                aria-label={title}
                id={`offline-votes-${idea.id}`}
                size={32}
                value={value}
                minValue={0}
                step={1}
                isDisabled={saving}
                incrementAriaLabel={formatMessage(messages.addOne)}
                decrementAriaLabel={formatMessage(messages.removeOne)}
                onChange={(next) => setVotes({ ...votes, [idea.id]: next })}
              />
            </div>
          </div>
        );
      })}
      {lastPage > 1 && (
        <div className={styles.pagination}>
          <Pagination page={page} pageCount={lastPage} onChange={setPage} />
        </div>
      )}
      {failed && (
        <div className={styles.error}>
          <Banner tone="error">
            {formatMessage(messages.offlineVotesSaveError)}
          </Banner>
        </div>
      )}
    </Modal>
  );
};

export default OfflineVotesModal;
