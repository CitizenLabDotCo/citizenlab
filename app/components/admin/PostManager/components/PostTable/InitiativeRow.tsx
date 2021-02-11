import React from 'react';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { uniq, get } from 'lodash-es';
import { findDOMNode } from 'react-dom';
import { DragSource } from 'react-dnd-cjs';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// services
import {
  IInitiativeData,
  updateInitiative,
  initiativeByIdStream,
} from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';

// components
import { Table, Icon } from 'semantic-ui-react';
import WrappedRow from './WrappedRow';
import T from 'components/T';
import Checkbox from 'components/UI/Checkbox';
import { StatusLabel } from 'cl2-component-library';

// utils
import localize, { InjectedLocalized } from 'utils/localize';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// style
import AssigneeSelect from './AssigneeSelect';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';
import { TFilterMenu, ManagerType } from '../..';
import { TitleLink, StyledRow } from './Row';
import SubRow from './SubRow';

// resources
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetTenant';
import GetInitiativeAllowedTransitions, {
  GetInitiativeAllowedTransitionsChildProps,
} from 'resources/GetInitiativeAllowedTransitions';
import { getDaysRemainingUntil } from 'utils/dateUtils';

// events
import eventEmitter from 'utils/eventEmitter';
import events, {
  StatusChangeModalOpen,
} from 'components/admin/PostManager/events';

interface DataProps {
  tenant: GetAppConfigurationChildProps;
  allowedTransitions: GetInitiativeAllowedTransitionsChildProps;
}

interface InputProps {
  type: ManagerType;
  initiative: IInitiativeData;
  statuses?: IInitiativeStatusData[];
  /** A set of ids of ideas/initiatives that are currently selected */
  selection: Set<string>;
  activeFilterMenu: TFilterMenu;
  className?: string;
  onClickCheckbox: (event) => void;
  onClickTitle: (event) => void;
  nothingHappens: (event) => void;
}

interface Props extends InputProps, DataProps {
  connectDragSource: any;
}

class InitiativeRow extends React.PureComponent<
  Props & InjectedIntlProps & InjectedLocalized
> {
  onUpdateInitiativePhases = (selectedPhases) => {
    updateInitiative(this.props.initiative.id, {
      phase_ids: selectedPhases,
    });
  };

  onUpdateInitiativeTopics = (selectedTopics) => {
    updateInitiative(this.props.initiative.id, {
      topic_ids: selectedTopics,
    });
  };

  onUpdateInitiativeStatus = (statusId) => {
    const { initiative } = this.props;
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

  onUpdateInitiativeAssignee = (assigneeId) => {
    const { initiative } = this.props;
    const initiativeId = initiative.id;

    updateInitiative(initiativeId, {
      assignee_id: assigneeId || null,
    });

    trackEventByName(tracks.changeInitiativeAssignment, {
      location: 'Initiative Manager',
      method: 'Changed through the dropdown in the table overview',
      initiative: initiativeId,
    });
  };

  renderTimingCell = () => {
    const { initiative, tenant, statuses } = this.props;

    const selectedStatus: string | undefined = get(
      initiative,
      'relationships.initiative_status.data.id'
    );
    const selectedStatusObject =
      statuses && statuses.find((status) => status.id === selectedStatus);

    if (
      selectedStatusObject &&
      !isNilOrError(tenant) &&
      tenant.attributes.settings.initiatives
    ) {
      if (selectedStatusObject.attributes.code === 'proposed') {
        return getDaysRemainingUntil(initiative.attributes.expires_at);
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

  render() {
    const {
      initiative,
      selection,
      connectDragSource,
      activeFilterMenu,
      statuses,
      className,
      onClickCheckbox,
      onClickTitle,
      nothingHappens,
      allowedTransitions,
    } = this.props;

    const selectedStatus: string | undefined = get(
      initiative,
      'relationships.initiative_status.data.id'
    );
    const selectedTopics = initiative.relationships.topics.data.map(
      (p) => p.id
    );
    const attrs = initiative.attributes;
    const active = selection.has(initiative.id);
    const assigneeId = get(initiative, 'relationships.assignee.data.id');

    return (
      <>
        <WrappedRow
          className={`e2e-initiative-row ${className}`}
          as={StyledRow}
          active={active}
          undraggable={activeFilterMenu === 'statuses'}
          ref={(instance) => {
            instance &&
              activeFilterMenu !== 'statuses' &&
              connectDragSource(findDOMNode(instance));
          }}
        >
          <Table.Cell collapsing={true}>
            <Checkbox
              checked={!!active}
              onChange={onClickCheckbox}
              size="21px"
            />
          </Table.Cell>
          <Table.Cell>
            <TitleLink
              className="e2e-initiative-manager-initiative-title"
              onClick={onClickTitle}
            >
              <T value={attrs.title_multiloc} />
            </TitleLink>
          </Table.Cell>
          <Table.Cell onClick={nothingHappens} singleLine>
            <AssigneeSelect
              onAssigneeChange={this.onUpdateInitiativeAssignee}
              assigneeId={assigneeId}
            />
          </Table.Cell>
          <Table.Cell>{this.renderTimingCell()}</Table.Cell>
          <Table.Cell singleLine>
            <Icon name="thumbs up" />
            {attrs.upvotes_count}
          </Table.Cell>
          <Table.Cell>{attrs.comments_count}</Table.Cell>
        </WrappedRow>
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
          onUpdatePhases={this.onUpdateInitiativePhases}
          onUpdateTopics={this.onUpdateInitiativeTopics}
          onUpdateStatus={this.onUpdateInitiativeStatus}
          postType="initiative"
        />
      </>
    );
  }
}

const initiativeSource = {
  beginDrag(props: Props) {
    return {
      type: 'initiative',
      id: props.initiative.id,
    };
  },
  endDrag(props: Props & InjectedIntlProps & InjectedLocalized, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    const { selection } = props;

    if (dropResult && dropResult.type) {
      const observables = selection.has(item.id)
        ? [...selection].map((id) => initiativeByIdStream(id).observable)
        : [initiativeByIdStream(item.id).observable];

      if (dropResult.type === 'topic') {
        combineLatest(observables)
          .pipe(take(1))
          .subscribe((initiatives) => {
            initiatives.map((initiative) => {
              const currentTopics = initiative.data.relationships.topics.data.map(
                (d) => d.id
              );
              const newTopics = uniq(currentTopics.concat(dropResult.id));
              updateInitiative(initiative.data.id, {
                topic_ids: newTopics,
              });
            });
          });
      }
    }
  },
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

const InitiativesRowWithHocs = injectIntl(
  localize(DragSource('IDEA', initiativeSource, collect)(InitiativeRow))
);

const Data = adopt<DataProps, InputProps>({
  tenant: <GetAppConfiguration />,
  allowedTransitions: ({ initiative, render }) => (
    <GetInitiativeAllowedTransitions id={initiative.id}>
      {render}
    </GetInitiativeAllowedTransitions>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <InitiativesRowWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
