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

interface Props {
  active: boolean;
  onClickRow: (event) => void;
  className?: string;
  activeFilterMenu: TFilterMenu;
  selectedPhases?: string[];
  phases?: IPhaseData[];
  selectedTopics?: string[];
  projectId?: string;
  statuses?: IIdeaStatusData[] | IInitiativeStatusData[];
  selectedStatus: string | undefined;
  onUpdatePhases: (id: string[]) => void;
  onUpdateTopics: (id: string[]) => void;
  onUpdateStatus: (id: string) => void;
}

export default ({
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
  onUpdateStatus
}: Props) => (
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
       {activeFilterMenu === 'statuses' && statuses &&
         <StatusSelector
           statuses={statuses}
           selectedStatus={selectedStatus}
           onUpdateStatus={onUpdateStatus}
         />
       }
     </Table.Cell>
   </Table.Row>
);
