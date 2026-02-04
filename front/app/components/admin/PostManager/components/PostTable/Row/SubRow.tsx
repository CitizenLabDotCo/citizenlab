import React from 'react';

import { Tr, Td, colors } from '@citizenlab/cl2-component-library';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IPhaseData } from 'api/phases/types';

import { TFilterMenu } from '../../..';

import IdeasStatusSelector from './selectors/IdeasStatusSelector';
import PhasesSelector from './selectors/PhasesSelector';
import ProjectSelector from './selectors/ProjectSelector';
import TopicsSelector from './selectors/TopicsSelector';

interface Props {
  active: boolean;
  className?: string;
  activeFilterMenu: TFilterMenu;
  selectedPhases?: string[];
  phases?: IPhaseData[];
  selectedTopics?: string[];
  projectId?: string;
  statuses?: IIdeaStatusData[];
  selectedStatus: string | undefined;
  // Only ideas can have phases, hence optional
  onUpdatePhases?: (id: string[]) => void;
  onUpdateTopics: (id: string[]) => void;
  onUpdateStatus: (id: string) => void;
}

const SubRow = ({
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
}: Props) => {
  return (
    <Tr className={className} background={active ? colors.grey300 : undefined}>
      <Td />
      <Td colSpan={6}>
        {activeFilterMenu === 'phases' && phases && onUpdatePhases && (
          <PhasesSelector
            selectedPhases={selectedPhases || []}
            phases={phases}
            onUpdatePhases={onUpdatePhases}
          />
        )}
        {activeFilterMenu === 'topics' && projectId && (
          <TopicsSelector
            selectedTopics={selectedTopics || []}
            projectId={projectId}
            onUpdateTopics={onUpdateTopics}
          />
        )}
        {activeFilterMenu === 'projects' && projectId && (
          <ProjectSelector projectId={projectId} />
        )}
        {activeFilterMenu === 'statuses' && statuses && (
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

export default SubRow;
