import React from 'react';

// components
import { Tr, Td } from '@citizenlab/cl2-component-library';
import PhasesSelector from './selectors/PhasesSelector';
import TopicsSelector from './selectors/TopicsSelector';
import ProjectSelector from './selectors/ProjectSelector';
import IdeasStatusSelector from './selectors/IdeasStatusSelector';
import InitiativesStatusSelector from './selectors/InitiativesStatusSelector';

// styling
import { colors } from 'utils/styleUtils';

// typings
import { TFilterMenu } from '../../..';
import { IPhaseData } from 'services/phases';
import { IIdeaStatusData } from 'services/ideaStatuses';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { GetInitiativeAllowedTransitionsChildProps } from 'resources/GetInitiativeAllowedTransitions';

interface Props {
  active: boolean;
  className?: string;
  activeFilterMenu: TFilterMenu;
  selectedPhases?: string[];
  phases?: IPhaseData[];
  selectedTopics?: string[];
  projectId?: string;
  statuses?: IIdeaStatusData[] | IInitiativeStatusData[] | undefined;
  selectedStatus: string | undefined;
  onUpdatePhases: (id: string[]) => void;
  onUpdateTopics: (id: string[]) => void;
  onUpdateStatus: (id: string) => void;
  allowedTransitions: GetInitiativeAllowedTransitionsChildProps;
  /* set allowedTransitions to null to allow all */
  postType: 'idea' | 'initiative';
}

export default ({
  active,
  className,
  activeFilterMenu,
  selectedPhases,
  phases,
  selectedTopics,
  projectId,
  statuses,
  selectedStatus,
  onUpdatePhases,
  onUpdateTopics,
  onUpdateStatus,
  allowedTransitions,
  postType,
}: Props) => {
  return (
    <Tr className={className} background={active ? colors.grey300 : undefined}>
      <Td />
      <Td colSpan={6}>
        {activeFilterMenu === 'phases' && phases && (
          <PhasesSelector
            selectedPhases={selectedPhases || []}
            phases={phases}
            onUpdatePhases={onUpdatePhases}
          />
        )}
        {activeFilterMenu === 'topics' && (
          <TopicsSelector
            selectedTopics={selectedTopics || []}
            onUpdateTopics={onUpdateTopics}
          />
        )}
        {activeFilterMenu === 'projects' && projectId && (
          <ProjectSelector projectId={projectId} />
        )}
        {activeFilterMenu === 'statuses' &&
          postType === 'initiative' &&
          statuses &&
          allowedTransitions !== undefined && (
            <InitiativesStatusSelector
              statuses={statuses as IInitiativeStatusData[]}
              selectedStatus={selectedStatus}
              onUpdateStatus={onUpdateStatus}
              allowedTransitions={allowedTransitions}
            />
          )}
        {activeFilterMenu === 'statuses' && postType === 'idea' && statuses && (
          <IdeasStatusSelector
            statuses={statuses as IIdeaStatusData[]}
            selectedStatus={selectedStatus}
            onUpdateStatus={onUpdateStatus}
          />
        )}
      </Td>
    </Tr>
  );
};
