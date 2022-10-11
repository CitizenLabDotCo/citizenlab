import React from 'react';

import PhasesSelector from './PhasesSelector';
import TopicsSelector from './TopicsSelector';
import ProjectSelector from './ProjectSelector';
import IdeasStatusSelector from './IdeasStatusSelector';
import InitiativesStatusSelector from './InitiativesStatusSelector';

import { Row, Cell } from 'components/admin/Table';
import { TFilterMenu } from '../..';
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
  // active,
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
    <Row className={className}>
      <Cell />
      <Cell colSpan="6">
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
      </Cell>
    </Row>
  );
};
