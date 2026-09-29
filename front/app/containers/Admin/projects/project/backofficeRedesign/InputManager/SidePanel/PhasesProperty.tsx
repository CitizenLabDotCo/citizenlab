import React, { useState } from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useIdeasPhases from 'api/ideas_phases/useIdeasPhases';

import PhaseDeselectModal from 'components/admin/PostManager/components/PostTable/Row/PhaseDeselectModal';
import { ideaHasVotesInPhase } from 'components/admin/PostManager/components/PostTable/Row/utils';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import OptionList from '../OptionList';
import TagChip from '../TagChip';
import usePickerOptions from '../usePickerOptions';
import { phaseIds } from '../utils';

import PropertyMenu from './PropertyMenu';
import PropertyRow from './PropertyRow';

interface Props {
  idea: IIdeaData;
}

const PhasesProperty = ({ idea }: Props) => {
  const { formatMessage } = useIntl();
  const { phaseOptions } = usePickerOptions(
    'ProjectIdeas',
    idea.relationships.project.data.id
  );
  const ideasPhases = useIdeasPhases(
    idea.relationships.ideas_phases.data.map((ideasPhase) => ideasPhase.id)
  );
  const { mutate: updateIdea, isPending } = useUpdateIdea();
  const [phaseToRemove, setPhaseToRemove] = useState<string | null>(null);
  const current = phaseIds(idea);

  const savePhases = (newPhaseIds: string[]) =>
    updateIdea({ id: idea.id, requestBody: { phase_ids: newPhaseIds } });

  const removePhase = (phaseId: string) =>
    savePhases(current.filter((id) => id !== phaseId));

  // Removing a phase also removes the votes the input got in it.
  const requestRemoval = (phaseId: string) => {
    if (ideaHasVotesInPhase(phaseId, ideasPhases)) {
      setPhaseToRemove(phaseId);
    } else {
      removePhase(phaseId);
    }
  };

  const otherPhases = phaseOptions.filter(
    (option) => !current.includes(option.value)
  );

  return (
    <PropertyRow label={formatMessage(messages.phases)}>
      {phaseOptions
        .filter((option) => current.includes(option.value))
        .map((option) => (
          <TagChip
            key={option.value}
            label={option.label}
            onRemove={() => requestRemoval(option.value)}
            removeLabel={formatMessage(messages.removeFromPhase, {
              phase: option.label,
            })}
          />
        ))}
      <PropertyMenu label={formatMessage(messages.copyToPhase)} icon="plus">
        {(close) =>
          otherPhases.length > 0 ? (
            <OptionList
              options={otherPhases}
              selected={[]}
              onToggle={(phaseId) => {
                savePhases([...current, phaseId]);
                close();
              }}
            />
          ) : (
            <Text m="8px" fontSize="s" color="coolGrey600">
              {formatMessage(messages.noOtherPhases)}
            </Text>
          )
        }
      </PropertyMenu>
      <PhaseDeselectModal
        open={!!phaseToRemove}
        isLoading={isPending}
        onClose={() => setPhaseToRemove(null)}
        onConfirm={() => {
          if (phaseToRemove) removePhase(phaseToRemove);
          setPhaseToRemove(null);
        }}
      />
    </PropertyRow>
  );
};

export default PhasesProperty;
