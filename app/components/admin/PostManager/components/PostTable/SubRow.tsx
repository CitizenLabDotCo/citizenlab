import React from 'react';

import PhasesSelector from './PhasesSelector';
import TopicsSelector from './TopicsSelector';
import ProjectSelector from './ProjectSelector';
import StatusSelector from './StatusSelector';

import { Table } from 'semantic-ui-react';
import { FilterCell } from './Row';
import { TFilterMenu } from '../..';
import { IPhaseData } from 'services/phases';
import { IIdeaStatusData } from 'services/ideaStatuses';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { GetInitiativeAllowedTransitionsChildProps } from 'resources/GetInitiativeAllowedTransitions';

interface Props {
  active: boolean;
  onClickRow: (event) => void;
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

export default  ({
  active,
  onClickRow,
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
  postType
}: Props) => {
  console.log(allowedTransitions);
  return (
    <Table.Row active={active} onClick={onClickRow} className={className}>
       <Table.Cell as={FilterCell} collapsing={true} />
       <Table.Cell colSpan={6} as={FilterCell}>
         {activeFilterMenu === 'phases' && phases &&
           <PhasesSelector
             selectedPhases={selectedPhases || []}
             phases={phases}
             onUpdatePhases={onUpdatePhases}
           />
         }
         {activeFilterMenu === 'topics' &&
           <TopicsSelector
             selectedTopics={selectedTopics || []}
             onUpdateTopics={onUpdateTopics}
           />
         }
         {activeFilterMenu === 'projects' && projectId &&
           <ProjectSelector projectId={projectId} />
         }
         {activeFilterMenu === 'statuses' && statuses && allowedTransitions !== undefined &&
           <StatusSelector
             statuses={statuses}
             selectedStatus={selectedStatus}
             onUpdateStatus={onUpdateStatus}
             allowedTransitions={allowedTransitions}
             postType={postType}
           />
         }
       </Table.Cell>
     </Table.Row>
  );
};
