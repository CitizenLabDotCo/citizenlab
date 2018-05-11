import React from 'react';
import { Observable } from 'rxjs/Observable';
import { uniq, keys, isEmpty } from 'lodash';
import { findDOMNode } from 'react-dom';
import { IModalInfo } from 'containers/App';
import { DragSource } from 'react-dnd';

// services
import { IIdeaData, updateIdea, ideaByIdStream } from 'services/ideas';
import { IPhaseData } from 'services/phases';
import { IIdeaStatusData } from 'services/ideaStatuses';

// components
import { Table, Icon, Checkbox } from 'semantic-ui-react';
import WrappedRow from './WrappedRow';
import T from 'components/T';
import PhasesSelector from './PhasesSelector';
import TopicsSelector from './TopicsSelector';
import ProjectSelector from './ProjectSelector';
import StatusSelector from './StatusSelector';

// utils
import eventEmitter from 'utils/eventEmitter';
import localize, { injectedLocalized } from 'utils/localize';

// i18n
import { FormattedDate, InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../../messages';

// style
import styled from 'styled-components';

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
`;


type Props = {
  idea: IIdeaData,
  phases: IPhaseData[],
  statuses: IIdeaStatusData[],
  onDeleteIdea: () => void,
  selected?: boolean,
  selectedIdeas: { [key: string]: boolean },
  onUnselectIdea: () => void,
  onToggleSelectIdea: () => void,
  onSingleSelectIdea: () => void;
  isDragging: boolean;
  connectDragSource: any;
  activeFilterMenu: string;
};

type State = {};

class Row extends React.PureComponent<Props & InjectedIntlProps & injectedLocalized, State> {

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
    updateIdea(this.props.idea.id, {
      idea_status_id: statusId,
    });
  }

  handleClickTitle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { idea } = this.props;
    eventEmitter.emit<IModalInfo>('adminIdeas', 'cardClick', {
      type: 'idea',
      id: idea.id,
      url: `/ideas/${idea.attributes.slug}`
    });
  }

  render() {
    const { idea, selected, connectDragSource, activeFilterMenu, phases, statuses } = this.props;
    const selectedStatus = idea.relationships.idea_status && idea.relationships.idea_status.data.id;
    const attrs = idea.attributes;
    return (
      <React.Fragment>
        <WrappedRow as={StyledRow} active={selected} onClick={this.onClickRow} ref={(instance) => {instance && connectDragSource(findDOMNode(instance));}}>
          <Table.Cell collapsing={true}>
            <Checkbox checked={selected} onChange={this.onClickCheckbox} />
          </Table.Cell>
          <Table.Cell>
            <TitleLink onClick={this.handleClickTitle}>
              <T value={attrs.title_multiloc} />
            </TitleLink>
          </Table.Cell>
          <Table.Cell>{attrs.author_name}</Table.Cell>
          <Table.Cell>
            <FormattedDate value={attrs.published_at} />
          </Table.Cell>
          <Table.Cell>
            <Icon name="thumbs up" />
            {attrs.upvotes_count}
          </Table.Cell>
          <Table.Cell>
            <Icon name="thumbs down" />
            {attrs.downvotes_count}
          </Table.Cell>
        </WrappedRow>
        <Table.Row active={selected} onClick={this.onClickRow}>
          <Table.Cell as={FilterCell} collapsing={true} />
          <Table.Cell colSpan={5} as={FilterCell}>
            {activeFilterMenu === 'phases' &&
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
            {activeFilterMenu === 'statuses' &&
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
  endDrag(props: Props & InjectedIntlProps & injectedLocalized, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();

    if (dropResult && dropResult.type === 'topic') {
      let ids = keys(props.selectedIdeas);

      if (ids.indexOf(item.id) < 0) {
        ids = [item.id];
      }

      const observables = ids.map((id) => ideaByIdStream(id).observable);

      Observable.combineLatest(observables).take(1).subscribe((ideas) => {
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

      Observable.combineLatest(observables).take(1).subscribe((ideas) => {
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

      Observable.combineLatest(observables).take(1).subscribe((ideas) => {
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
    }

  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

export default injectIntl(localize(DragSource('IDEA', ideaSource, collect)(Row)));
