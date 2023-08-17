import React, { MouseEvent, ChangeEvent, ReactNode } from 'react';
import { uniq, get } from 'lodash-es';
import { useDrag } from 'react-dnd';

// services
import { IInitiativeStatusData } from 'api/initiative_statuses/types';

// components
import { TitleLink } from '.';
import StyledRow from './StyledRow';
import { Icon } from 'semantic-ui-react';
import T from 'components/T';
import Checkbox from 'components/UI/Checkbox';
import { Td, StatusLabel } from '@citizenlab/cl2-component-library';
import SubRow from './SubRow';
import AssigneeSelect from '../AssigneeSelect';

// styling
import { colors } from 'utils/styleUtils';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../../tracks';

// typings
import { TFilterMenu, ManagerType } from '../../..';

// resources
import { getPeriodRemainingUntil } from 'utils/dateUtils';

// events
import eventEmitter from 'utils/eventEmitter';
import events, {
  StatusChangeModalOpen,
} from 'components/admin/PostManager/events';

// hooks
import useInitiatives from 'api/initiatives/useInitiatives';
import useUpdateInitiative from 'api/initiatives/useUpdateInitiative';

// types
import { IInitiativeData } from 'api/initiatives/types';
import useInitiativeCosponsorsRequired from 'hooks/useInitiativeCosponsorsRequired';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useInitiativeAllowedTransitions from 'api/initiative_allowed_transitions/useInitiativeAllowedTransitions';

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
  onClick?: (event: any) => void;
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
  const { data: appConfiguration } = useAppConfiguration();
  const { data: allowedTransitions } = useInitiativeAllowedTransitions(
    initiative.id
  );
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

  const onUpdateInitiativePhases = (selectedPhases: string[]) => {
    updateInitiative({
      initiativeId: initiative.id,
      requestBody: {
        phase_ids: selectedPhases,
      },
    });
  };

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

  const renderTimingCell = () => {
    const selectedStatus: string | undefined = get(
      initiative,
      'relationships.initiative_status.data.id'
    );
    const selectedStatusObject =
      statuses && statuses.find((status) => status.id === selectedStatus);

    if (
      selectedStatusObject &&
      appConfiguration?.data.attributes.settings.initiatives
    ) {
      if (selectedStatusObject.attributes.code === 'proposed') {
        return getPeriodRemainingUntil(initiative.attributes.expires_at);
      } else {
        return (
          <StatusLabel
            text={<T value={selectedStatusObject.attributes.title_multiloc} />}
            backgroundColor={selectedStatusObject.attributes.color}
          />
        );
      }
    }

    return null;
  };

  const selectedStatus = initiative.relationships.initiative_status?.data?.id;
  const selectedTopics = initiative.relationships.topics.data.map((p) => p.id);
  const attrs = initiative.attributes;
  const active = selection.has(initiative.id);
  const assigneeId = get(initiative, 'relationships.assignee.data.id');

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
        <Cell>{renderTimingCell()}</Cell>
        <Cell>
          <Icon name="thumbs up" />
          {attrs.likes_count}
        </Cell>
        <Cell>{attrs.comments_count}</Cell>
        {/* {cosponsorsRequired && <Cell>{attrs.cosponsorships.length}</Cell>} */}
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
        onUpdatePhases={onUpdateInitiativePhases}
        onUpdateTopics={onUpdateInitiativeTopics}
        onUpdateStatus={onUpdateInitiativeStatus}
        postType="initiative"
      />
    </>
  );
};

export default InitiativeRow;
