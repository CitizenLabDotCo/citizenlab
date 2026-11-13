import React, { useState } from 'react';

import {
  Box,
  Button,
  Input,
  Spinner,
  Text,
} from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';

import useIdeas from 'api/ideas/useIdeas';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import phasesKeys from 'api/phases/keys';
import { IPhaseData } from 'api/phases/types';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import useLocalize from 'hooks/useLocalize';

import Pagination from 'components/Pagination';
import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from '../messages';

interface Props {
  phase: IPhaseData;
  onClose: () => void;
}

const OfflineVotesModal = ({ phase, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [voters, setVoters] = useState(
    String(phase.attributes.manual_voters_amount ?? 0)
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
  const invalid =
    Object.values(votes).some((value) => !/^\d+$/.test(value)) ||
    !/^\d+$/.test(voters);

  const save = async () => {
    setSaving(true);
    setFailed(false);
    try {
      if (phase.attributes.voting_method === 'budgeting') {
        await updatePhase({
          phaseId: phase.id,
          manual_voters_amount: Number(voters),
        });
      }
      for (const [id, value] of Object.entries(votes)) {
        await updateIdea({
          id,
          requestBody: { manual_votes_amount: Number(value) },
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
      opened
      close={() => {
        if (!saving) onClose();
      }}
      header={formatMessage(messages.addOfflineVotes)}
      variant="bo"
    >
      <Box p="24px">
        <Text variant="boHelper" mt="0">
          {formatMessage(messages.offlineVotesHelp)}
        </Text>
        {phase.attributes.voting_method === 'budgeting' && (
          <Box mb="16px">
            <Input
              type="number"
              variant="bo"
              label={formatMessage(messages.offlineParticipants)}
              value={voters}
              min="0"
              onChange={setVoters}
              disabled={saving}
            />
          </Box>
        )}
        {!ideas && <Spinner />}
        {ideas?.data.map((idea) => {
          const value =
            votes[idea.id] ?? String(idea.attributes.manual_votes_amount ?? 0);
          return (
            <Box
              key={idea.id}
              display="flex"
              alignItems="center"
              gap="16px"
              mb="16px"
            >
              <Box as="label" htmlFor={`offline-votes-${idea.id}`} flexGrow={1}>
                <Text as="span" variant="boLabel" m="0">
                  {localize(idea.attributes.title_multiloc)}
                </Text>
              </Box>
              <Box display="flex" alignItems="center" gap="4px">
                <Button
                  buttonStyle="bo-secondary"
                  width="32px"
                  padding="0"
                  ariaLabel={formatMessage(messages.removeOne)}
                  disabled={saving || Number(value) <= 0}
                  onClick={() =>
                    setVotes({
                      ...votes,
                      [idea.id]: String(Math.max(0, (Number(value) || 0) - 1)),
                    })
                  }
                >
                  −
                </Button>
                <Box width="80px">
                  <Input
                    id={`offline-votes-${idea.id}`}
                    variant="bo"
                    type="number"
                    min="0"
                    value={value}
                    disabled={saving}
                    onChange={(next) => setVotes({ ...votes, [idea.id]: next })}
                  />
                </Box>
                <Button
                  buttonStyle="bo-secondary"
                  width="32px"
                  padding="0"
                  ariaLabel={formatMessage(messages.addOne)}
                  disabled={saving}
                  onClick={() =>
                    setVotes({
                      ...votes,
                      [idea.id]: String(Math.max(0, Number(value) || 0) + 1),
                    })
                  }
                >
                  +
                </Button>
              </Box>
            </Box>
          );
        })}
        {lastPage > 1 && (
          <Pagination
            currentPage={page}
            totalPages={lastPage}
            loadPage={setPage}
          />
        )}
        {failed && (
          <Error text={formatMessage(messages.offlineVotesSaveError)} />
        )}
        <Box display="flex" justifyContent="flex-end" mt="24px">
          <Button
            buttonStyle="bo-primary"
            processing={saving}
            disabled={!ideas || ideas.data.length === 0 || invalid}
            onClick={save}
          >
            {formatMessage(messages.saveOfflineVotes)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default OfflineVotesModal;
