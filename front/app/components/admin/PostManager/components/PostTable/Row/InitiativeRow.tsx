import React, { MouseEvent, ChangeEvent, ReactNode } from 'react';

import { Td, colors } from '@citizenlab/cl2-component-library';
import { uniq } from 'lodash-es';
import { useDrag } from 'react-dnd';
import { Icon } from 'semantic-ui-react';

import useInitiativeAllowedTransitions from 'api/initiative_allowed_transitions/useInitiativeAllowedTransitions';
import { IInitiativeStatusData } from 'api/initiative_statuses/types';
import { IInitiativeData } from 'api/initiatives/types';
import useInitiatives from 'api/initiatives/useInitiatives';
import useUpdateInitiative from 'api/initiatives/useUpdateInitiative';

import useLocale from 'hooks/useLocale';

import useInitiativeCosponsorsRequired from 'containers/InitiativesShow/hooks/useInitiativeCosponsorsRequired';

import events, {
  StatusChangeModalOpen,
} from 'components/admin/PostManager/events';
import T from 'components/T';
import Checkbox from 'components/UI/Checkbox';

import { trackEventByName } from 'utils/analytics';
import { timeAgo } from 'utils/dateUtils';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

import { TFilterMenu, ManagerType } from '../../..';
import tracks from '../../../tracks';
import AssigneeSelect from '../AssigneeSelect';

import StyledRow from './StyledRow';
import SubRow from './SubRow';

import { TitleLink } from '.';

interface Props {
  type: ManagerType;
  initiative: IInitiativeData;
  statuses?: IInitiativeStatusData[];
  /** A set of ids of ideas/initiatives that are currently selected */
  selection: Set<string>;
  activeFilterMenu: TFilterMenu;
  className?: string;
  onClickCheckbox: (event: ChangeEvent<HTMLInputElement>) => void;
  onClickTitle: (event: MouseEvent) => void;
  nothingHappens: () => void;
}

interface CellProps {
  onClick?: (event: MouseEvent) => void;
  children: ReactNode;
}

const Cell = ({ onClick, children }: CellProps) => (
  <Td borderBottom="none !important" onClick={onClick}>
    {children}
  </Td>
);

const InitiativeRow = ({
  initiative,
  selection,
  activeFilterMenu,
  statuses,
  className,
  onClickCheckbox,
  onClickTitle,
  nothingHappens,
}: Props) => {
  const { data: initiatives } = useInitiatives({});
  const { mutate: updateInitiative } = useUpdateInitiative();
  const { data: allowedTransitions } = useInitiativeAllowedTransitions(
    initiative.id
  );
  const locale = useLocale();
  const cosponsorsRequired = useInitiativeCosponsorsRequired();

  const [_collected, drag] = useDrag({
    type: 'IDEA',
    item: {
      type: 'initiative',
      id: initiative.id,
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<{
        type: 'topic';
        id: string;
      }>();

      if (dropResult && dropResult.type) {
        let droppedIniatitives: IInitiativeData[] = [];
        if (selection.has(item.id)) {
          droppedIniatitives =
            initiatives?.data.filter((i) => {
              return selection.has(i.id);
            }) || [];
        } else {
          const draggedIni = initiatives?.data.find((i) => i.id === item.id);
          droppedIniatitives = draggedIni ? [draggedIni] : [];
        }

        droppedIniatitives.map((initiative) => {
          if (dropResult.type === 'topic') {
            const currentTopics = initiative.relationships.topics.data.map(
              (d) => d.id
            );
            const newTopics = uniq(currentTopics.concat(dropResult.id));
            updateInitiative({
              initiativeId: initiative.id,
              requestBody: {
                topic_ids: newTopics,
              },
            });
          }
        });
      }
    },
  });

  if (!allowedTransitions) return null;

  const onUpdateInitiativeTopics = (selectedTopics: string[]) => {
    updateInitiative({
      initiativeId: initiative.id,
      requestBody: {
        topic_ids: selectedTopics,
      },
    });
  };

  const onUpdateInitiativeStatus = (statusId: string) => {
    const initiativeId = initiative.id;

    eventEmitter.emit<StatusChangeModalOpen>(events.statusChangeModalOpen, {
      initiativeId,
      newStatusId: statusId,
    });

    trackEventByName(tracks.initiativeStatusChange, {
      location: 'Initiative overview',
      method: 'Clicked on the squares representing the statuses',
      initiative: initiativeId,
    });
  };

  const onUpdateInitiativeAssignee = (assigneeId: string | undefined) => {
    const initiativeId = initiative.id;

    updateInitiative({
      initiativeId: initiative.id,
      requestBody: {
        assignee_id: assigneeId || null,
      },
    });

    trackEventByName(tracks.changeInitiativeAssignment, {
      location: 'Initiative Manager',
      method: 'Changed through the dropdown in the table overview',
      initiative: initiativeId,
    });
  };

  const selectedStatus = initiative.relationships.initiative_status?.data?.id;
  const selectedTopics = initiative.relationships.topics.data.map((p) => p.id);
  const attrs = initiative.attributes;
  const active = selection.has(initiative.id);
  const assigneeId = initiative.relationships.assignee.data?.id;

  return (
    <>
      <StyledRow
        className={`e2e-initiative-row ${className}`}
        undraggable={activeFilterMenu === 'statuses'}
        background={active ? colors.grey300 : undefined}
        ref={drag}
      >
        <Cell>
          <Checkbox checked={!!active} onChange={onClickCheckbox} size="21px" />
        </Cell>
        <Cell>
          <TitleLink
            className="e2e-initiative-manager-initiative-title"
            onClick={onClickTitle}
          >
            <T value={attrs.title_multiloc} />
          </TitleLink>
        </Cell>
        <Cell onClick={nothingHappens}>
          <AssigneeSelect
            onAssigneeChange={onUpdateInitiativeAssignee}
            assigneeId={assigneeId}
          />
        </Cell>
        <Cell>
          <Icon name="thumbs up" />
          {attrs.likes_count}
        </Cell>
        <Cell>{attrs.comments_count}</Cell>
        {cosponsorsRequired && (
          <Cell>
            {attrs.cosponsorships.filter((c) => c.status === 'accepted').length}
          </Cell>
        )}
        {!isNilOrError(locale) && (
          <Cell>
            {timeAgo(Date.parse(initiative.attributes.created_at), locale)}
          </Cell>
        )}
      </StyledRow>
      <SubRow
        {...{
          active,
          className,
          activeFilterMenu,
          selectedTopics,
          statuses,
          selectedStatus,
          allowedTransitions,
        }}
        onUpdateTopics={onUpdateInitiativeTopics}
        onUpdateStatus={onUpdateInitiativeStatus}
        postType="initiative"
      />
    </>
  );
};

export default InitiativeRow;
