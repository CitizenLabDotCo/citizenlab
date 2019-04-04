import React from 'react';
import { adopt } from 'react-adopt';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { uniq, keys, isEmpty, get } from 'lodash-es';
import { findDOMNode } from 'react-dom';
import { DragSource } from 'react-dnd';

// services
import { IIdeaData, updateIdea, ideaByIdStream } from 'services/ideas';
import { IPhaseData } from 'services/phases';
import { IIdeaStatusData } from 'services/ideaStatuses';

// components
import { Table, Icon } from 'semantic-ui-react';
import WrappedRow from './WrappedRow';
import T from 'components/T';
import PhasesSelector from './PhasesSelector';
import TopicsSelector from './TopicsSelector';
import ProjectSelector from './ProjectSelector';
import StatusSelector from './StatusSelector';
import Checkbox from 'components/UI/Checkbox';
import FeatureFlag from 'components/FeatureFlag';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// utils
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedRelative, InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../../messages';

// style
import styled from 'styled-components';
import AssigneeSelect from './AssigneeSelect';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';

const StyledRow = styled.tr`
  height: 5.5rem;
  cursor: move;
`;

const FilterCell = styled.td`
  border-top: none !important;
`;

const TitleLink = styled.a`
  display: block;
  display: -webkit-box;
  margin: 0 auto;
  font-size: $font-size;
  line-height: $line-height;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: black;
  &:hover, &:focus {
    text-decoration: underline;
  }
`;

type InputProps = {
  idea: IIdeaData,
  phases?: IPhaseData[],
  statuses?: IIdeaStatusData[],
  selected?: boolean,
  selectedIdeas: { [key: string]: boolean },
  onUnselectIdea: () => void,
  onToggleSelectIdea: () => void,
  onSingleSelectIdea: () => void;
  connectDragSource: any;
  activeFilterMenu: string | null;
  openIdea: (ideaId: string) => void;
};

type DataProps = {
  tenant: GetTenantChildProps,
  authUser: GetAuthUserChildProps
};

type Props = InputProps & DataProps;

type State = {};

class Row extends React.PureComponent<Props & InjectedIntlProps & InjectedLocalized, State> {

  onClickRow = (event) => {
    if (event.ctrlKey) {
      this.props.onToggleSelectIdea();
    } else if (event.shiftKey) {

    } else {
      this.props.onSingleSelectIdea();
    }
  }

  onClickCheckbox = (event) => {
    event.stopPropagation();
    this.props.onToggleSelectIdea();
  }

  onUpdateIdeaPhases = (selectedPhases) => {
    updateIdea(this.props.idea.id, {
      phase_ids: selectedPhases,
    });
  }

  onUpdateIdeaTopics = (selectedTopics) => {
    updateIdea(this.props.idea.id, {
      topic_ids: selectedTopics,
    });
  }

  onUpdateIdeaStatus = (statusId) => {
    const { tenant, idea, authUser }  = this.props;
    const ideaId = idea.id;
    const adminAtWorkId = authUser ? authUser.id : null;
    const tenantId = !isNilOrError(tenant) && tenant.id;

    updateIdea(this.props.idea.id, {
      idea_status_id: statusId,
    });

    trackEventByName(tracks.ideaStatusChange, {
      tenant: tenantId,
      location: 'Idea overview',
      method: 'Clicked on the squares representing the statuses',
      idea: ideaId,
      adminAtWork: adminAtWorkId
    });
  }

  handleClickTitle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { idea, openIdea } = this.props;
    openIdea(idea.id);
  }

  nothingHappens = (event) => {
    event.preventDefault();
    event.stopPropagation();
  }

  render() {
    const { idea, selected, connectDragSource, activeFilterMenu, phases, statuses } = this.props;
    const selectedStatus: string | undefined = get(idea, 'relationships.idea_status.data.id');
    const attrs = idea.attributes;
    return (
      <React.Fragment>
        <WrappedRow as={StyledRow} active={selected} onClick={this.onClickRow} ref={(instance) => { instance && connectDragSource(findDOMNode(instance)); }}>
          <Table.Cell collapsing={true}>
            <Checkbox value={!!selected} onChange={this.onClickCheckbox} size="17px"/>
          </Table.Cell>
          <Table.Cell>
            <TitleLink onClick={this.handleClickTitle}>
              <T value={attrs.title_multiloc} />
            </TitleLink>
          </Table.Cell>
          <Table.Cell onClick={this.nothingHappens} singleLine><AssigneeSelect ideaId={idea.id}/></Table.Cell>
          <Table.Cell>
            <FormattedRelative value={attrs.published_at} />
          </Table.Cell>
          <Table.Cell singleLine>
            <Icon name="thumbs up" />
            {attrs.upvotes_count}
          </Table.Cell>
          <Table.Cell singleLine>
            <Icon name="thumbs down" />
            {attrs.downvotes_count}
          </Table.Cell>
          <FeatureFlag name="participatory_budgeting">
            <Table.Cell singleLine>
              {attrs.baskets_count}
            </Table.Cell>
          </FeatureFlag>
        </WrappedRow>
        <Table.Row active={selected} onClick={this.onClickRow}>
          <Table.Cell as={FilterCell} collapsing={true} />
          <Table.Cell colSpan={6} as={FilterCell}>
            {activeFilterMenu === 'phases' && phases &&
              <PhasesSelector
                selectedPhases={idea.relationships.phases.data.map((p) => p.id)}
                phases={phases}
                onUpdateIdeaPhases={this.onUpdateIdeaPhases}
              />
            }
            {activeFilterMenu === 'topics' &&
              <TopicsSelector
                selectedTopics={idea.relationships.topics.data.map((p) => p.id)}
                onUpdateIdeaTopics={this.onUpdateIdeaTopics}
              />
            }
            {activeFilterMenu === 'projects' &&
              <ProjectSelector projectId={idea.relationships.project.data && idea.relationships.project.data.id} />
            }
            {activeFilterMenu === 'statuses' && statuses &&
              <StatusSelector
                statuses={statuses}
                selectedStatus={selectedStatus}
                onUpdateIdeaStatus={this.onUpdateIdeaStatus}
              />
            }
          </Table.Cell>
        </Table.Row>
      </React.Fragment>
    );
  }
}

const ideaSource = {
  beginDrag(props: Props) {
    return {
      type: 'idea',
      id: props.idea.id,
      idea: props.idea,
    };
  },
  endDrag(props: Props & InjectedIntlProps & InjectedLocalized, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    const { tenant, idea, authUser }  = props;
    const ideaId = idea.id;
    const adminAtWorkId: string | null = authUser ? authUser.id : null;
    const tenantId = !isNilOrError(tenant) && tenant.id;

    if (dropResult && dropResult.type === 'topic') {
      let ids = keys(props.selectedIdeas);

      if (ids.indexOf(item.id) < 0) {
        ids = [item.id];
      }

      const observables = ids.map((id) => ideaByIdStream(id).observable);

      combineLatest(observables).pipe(take(1)).subscribe((ideas) => {
        ideas.map((idea) => {
          const currentTopics = idea.data.relationships.topics.data.map((d) => d.id);
          const newTopics = uniq(currentTopics.concat(dropResult.id));
          updateIdea(idea.data.id, {
            topic_ids: newTopics,
          });
        });
      });
    }

    if (dropResult && dropResult.type === 'phase') {
      let ids = keys(props.selectedIdeas);

      if (ids.indexOf(item.id) < 0) {
        ids = [item.id];
      }

      const observables = ids.map((id) => ideaByIdStream(id).observable);

      combineLatest(observables).pipe(take(1)).subscribe((ideas) => {
        ideas.map((idea) => {
          const currentPhases = idea.data.relationships.phases.data.map((d) => d.id);
          const newPhases = uniq(currentPhases.concat(dropResult.id));
          updateIdea(idea.data.id, {
            phase_ids: newPhases,
          });
        });
      });
    }

    if (dropResult && dropResult.type === 'project') {
      let ids = keys(props.selectedIdeas);

      if (ids.indexOf(item.id) < 0) {
        ids = [item.id];
      }

      const observables = ids.map((id) => ideaByIdStream(id).observable);

      combineLatest(observables).pipe(take(1)).subscribe((ideas) => {
        ideas.map((idea) => {
          const newProject = dropResult.id;
          const hasPhases = !isEmpty(idea.data.relationships.phases.data);

          if (hasPhases) {
            const ideaTitle = props.localize(idea.data.attributes.title_multiloc);
            const message = props.intl.formatMessage(messages.losePhaseInfoConfirmation, { ideaTitle });

            if (window.confirm(message)) {
              updateIdea(idea.data.id, {
                project_id: newProject,
                phase_ids: [],
              });
            }
          } else {
            updateIdea(idea.data.id, {
              project_id: newProject,
              phase_ids: [],
            });
          }
        });
      });
    }

    if (dropResult && dropResult.type === 'ideaStatus') {
      let ids = keys(props.selectedIdeas);

      if (ids.indexOf(item.id) < 0) {
        ids = [item.id];
      }

      ids.forEach((ideaId) => {
        updateIdea(ideaId, {
          idea_status_id: dropResult.id,
        });
      });

      trackEventByName(tracks.ideaStatusChange, {
        tenant: tenantId,
        location: 'Idea overview',
        method: 'Dragged and dropped idea in idea manager',
        idea: ideaId,
        adminAtWork: adminAtWorkId
      });
    }

  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

const RowWithHOCs = injectIntl(localize(DragSource('IDEA', ideaSource, collect)(Row)));

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  tenant: <GetTenant />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <RowWithHOCs {...dataProps} {...inputProps} />}
  </Data>
);
