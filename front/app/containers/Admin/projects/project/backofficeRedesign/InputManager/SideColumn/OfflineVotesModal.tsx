import React, { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

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

interface FormValues {
  manual_voters_amount: number;
  votes: Partial<Record<string, number>>;
}

// A cleared number field reports NaN.
const isNumber = (value: number | undefined) =>
  value === undefined || !Number.isNaN(value);

const OfflineVotesModal = ({ phase, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      manual_voters_amount: phase.attributes.manual_voters_amount ?? 0,
      votes: {},
    },
  });
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

  const save = handleSubmit(async ({ manual_voters_amount, votes }) => {
    try {
      if (phase.attributes.voting_method === 'budgeting') {
        await updatePhase({ phaseId: phase.id, manual_voters_amount });
      }
      for (const [id, value] of Object.entries(votes)) {
        // Every rendered idea has an entry; only edited ones have a value.
        if (value === undefined) continue;

        await updateIdea({
          id,
          requestBody: { manual_votes_amount: value },
        });
      }
    } catch {
      setError('root', { type: 'server' });
      return;
    }

    queryClient.invalidateQueries({ queryKey: phasesKeys.items() });
    queryClient.invalidateQueries({
      queryKey: phasesKeys.list({
        projectId: phase.relationships.project.data.id,
      }),
    });
    onClose();
  });

  return (
    <Modal
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen && !isSubmitting) onClose();
      }}
      title={formatMessage(messages.addOfflineVotes)}
      primaryAction={{
        label: formatMessage(messages.saveOfflineVotes),
        onPress: () => save(),
        isPending: isSubmitting,
        isDisabled: !ideas || ideas.data.length === 0 || !isValid,
      }}
    >
      <p className={styles.modalHelp}>
        {formatMessage(messages.offlineVotesHelp)}
      </p>
      {phase.attributes.voting_method === 'budgeting' && (
        <div className={styles.participants}>
          <Controller
            control={control}
            name="manual_voters_amount"
            rules={{ validate: isNumber }}
            render={({ field }) => (
              <NumberField
                label={formatMessage(messages.offlineParticipants)}
                value={field.value}
                minValue={0}
                step={1}
                onChange={field.onChange}
                isDisabled={isSubmitting}
              />
            )}
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

        return (
          <div key={idea.id} className={styles.voteRow}>
            <span className={styles.voteLabel}>{title}</span>
            <div className={styles.voteField}>
              <Controller
                control={control}
                name={`votes.${idea.id}`}
                rules={{ validate: isNumber }}
                render={({ field }) => (
                  <NumberField
                    aria-label={title}
                    id={`offline-votes-${idea.id}`}
                    size={32}
                    value={
                      field.value ?? idea.attributes.manual_votes_amount ?? 0
                    }
                    minValue={0}
                    step={1}
                    isDisabled={isSubmitting}
                    incrementAriaLabel={formatMessage(messages.addOne)}
                    decrementAriaLabel={formatMessage(messages.removeOne)}
                    onChange={field.onChange}
                  />
                )}
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
      {errors.root && (
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
