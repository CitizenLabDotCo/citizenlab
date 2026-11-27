import React, { useState } from 'react';

import Icon from 'design-system/Icon';
import { MenuTrigger } from 'design-system/Menu';
import Text from 'design-system/Text';
import UnstyledButton from 'design-system/UnstyledButton';

import { IIdeaData } from 'api/ideas/types';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useIdeasPhases from 'api/ideas_phases/useIdeasPhases';

import PhaseDeselectModal from 'components/admin/PostManager/components/PostTable/Row/PhaseDeselectModal';
import { ideaHasVotesInPhase } from 'components/admin/PostManager/components/PostTable/Row/utils';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import OptionList from '../OptionList';
import usePickerOptions from '../usePickerOptions';
import { phaseIds } from '../utils';

import PropertyRow from './PropertyRow';
import styles from './SidePanel.module.css';

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
  const names = phaseOptions
    .filter((option) => current.includes(option.value))
    .map((option) => option.label)
    .join(', ');

  return (
    <PropertyRow label={formatMessage(messages.phase)}>
      <div className={styles.phases}>
        <Text as="span" variant="ui" tone="primary">
          {names}
        </Text>
        {/* Every phase, ticked where the idea is: tick to copy it there,
            untick to take it out. */}
        <MenuTrigger>
          <UnstyledButton
            className={styles.linkTrigger}
            isDisabled={otherPhases.length === 0 && current.length < 2}
          >
            {formatMessage(messages.copyToPhase)}
            <Icon name="chevron-down-12" />
          </UnstyledButton>
          <OptionList
            aria-label={formatMessage(messages.copyToPhase)}
            options={phaseOptions.map((option) => ({
              ...option,
              // The idea stays in at least one phase.
              disabled: current.length === 1 && current.includes(option.value),
            }))}
            selected={current}
            onToggle={(phaseId) =>
              current.includes(phaseId)
                ? requestRemoval(phaseId)
                : savePhases([...current, phaseId])
            }
          />
        </MenuTrigger>
      </div>
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
