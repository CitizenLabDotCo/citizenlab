import React, { useState } from 'react';

import Button from 'design-system/Button';
import { MenuTrigger } from 'design-system/Menu';
import TagGroup, { Tag } from 'design-system/TagGroup';
import { Key } from 'design-system/types';

import { IIdeaData } from 'api/ideas/types';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useIdeasPhases from 'api/ideas_phases/useIdeasPhases';

import PhaseDeselectModal from 'components/admin/PostManager/components/PostTable/Row/PhaseDeselectModal';
import { ideaHasVotesInPhase } from 'components/admin/PostManager/components/PostTable/Row/utils';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import OptionList from '../OptionList';
import useInputTermLabels from '../useInputTermLabels';
import usePickerOptions from '../usePickerOptions';
import { phaseIds } from '../utils';

import PropertyRow from './PropertyRow';

interface Props {
  idea: IIdeaData;
}

const PhasesProperty = ({ idea }: Props) => {
  const { formatMessage } = useIntl();
  const { inputTerm } = useInputTermLabels();
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
  const label = formatMessage(messages.phases);

  const savePhases = (newPhaseIds: string[]) =>
    updateIdea({ id: idea.id, requestBody: { phase_ids: newPhaseIds } });

  const removePhase = (phaseId: string) =>
    savePhases(current.filter((id) => id !== phaseId));

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

  const addButton = (
    <Button
      size={28}
      variant="quiet"
      icon="plus-16"
      disabledReason={
        otherPhases.length === 0
          ? formatMessage(messages.noOtherPhasesForTerms, { inputTerm })
          : undefined
      }
    >
      {formatMessage(messages.copyToPhase)}
    </Button>
  );

  return (
    <PropertyRow label={label}>
      {/* The row draws the label on the left, so the group takes an aria-label. */}
      <TagGroup
        aria-label={label}
        onRemove={(keys: Set<Key>) =>
          keys.forEach((key) => requestRemoval(String(key)))
        }
        add={
          otherPhases.length > 0 ? (
            <MenuTrigger>
              {addButton}
              <OptionList
                aria-label={formatMessage(messages.copyToPhase)}
                options={otherPhases}
                selected={[]}
                onToggle={(phaseId) => savePhases([...current, phaseId])}
                selectionMode="single"
              />
            </MenuTrigger>
          ) : (
            addButton
          )
        }
      >
        {phaseOptions
          .filter((option) => current.includes(option.value))
          .map((option) => (
            <Tag key={option.value} id={option.value}>
              {option.label}
            </Tag>
          ))}
      </TagGroup>
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
