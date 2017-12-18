import * as React from 'react';
import { uniq, flow } from 'lodash';

// components
import { Table, Icon, Dropdown, Popup, Button, Checkbox } from 'semantic-ui-react';
import { FormattedDate } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import { injectTFunc } from 'components/T/utils';
import messages from '../../messages';

import { IIdeaData, updateIdea } from 'services/ideas';
import { IPhaseData } from 'services/phases';
import { ITopicData } from 'services/topics';
import { IIdeaStatusData } from 'services/ideaStatuses';
import { DragSource } from 'react-dnd';
import PhasesSelector from './PhasesSelector';
import TopicsSelector from './TopicsSelector';


// style
import styled from 'styled-components';

const StyledRow = styled.tr`
  height: 5rem;
`;

const FilterCell = styled.td`
  border-top: none !important;
`;


type Props = {
  idea: IIdeaData,
  phases: IPhaseData[],
  topics: ITopicData[],
  tFunc: () => string,
  onDeleteIdea: () => void,
  selected?: boolean,
  onSelectIdea: () => void,
  onUnselectIdea: () => void,
  onToggleSelectIdea: () => void,
  onSingleSelectIdea: () => void;
  isDragging: boolean;
  connectDragSource: any;
  filterMode: string;
};

class Row extends React.PureComponent<Props> {

  onClickRow = (event) => {
    if (event.ctrlKey) {
      this.props.onToggleSelectIdea();
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

  render() {
    const { idea, onDeleteIdea, selected, isDragging, connectDragSource, filterMode, phases, topics } = this.props;
    const attrs = idea.attributes;
    return (
      <React.Fragment>
        <Table.Row as={StyledRow} active={selected} onClick={this.onClickRow}>
          <Table.Cell>
            <Checkbox checked={selected} onChange={this.onClickCheckbox} />
            {connectDragSource(<div><Icon name="content" /></div>)}
          </Table.Cell>
          <Table.Cell>
            <T value={attrs.title_multiloc} />
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
        </Table.Row>
        <Table.Row active={selected} onClick={this.onClickRow}>
          <Table.Cell colSpan={6} textAlign="right" as={FilterCell}>
            {filterMode === 'phases' &&
              <PhasesSelector
                selectedPhases={idea.relationships.phases.data.map((p) => p.id)}
                phases={phases}
                onUpdateIdeaPhases={this.onUpdateIdeaPhases}
              />
            }
            {filterMode === 'topics' &&
              <TopicsSelector
                selectedTopics={idea.relationships.topics.data.map((p) => p.id)}
                onUpdateIdeaTopics={this.onUpdateIdeaTopics}
              />
            }
          </Table.Cell>
        </Table.Row>
      </React.Fragment>
    );
  }
}

const ideaSource = {
  beginDrag(props) {
    return {
      type: 'idea',
      id: props.idea.id,
      idea: props.idea,
    };
  },
  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();

    if (dropResult && dropResult.type === 'topic') {
      const currentTopics = (item.idea as IIdeaData).relationships.topics.data.map((d) => d.id);
      const newTopics = uniq(currentTopics.concat(dropResult.id));
      updateIdea(item.id, {
        topic_ids: newTopics,
      });
    }

    if (dropResult && dropResult.type === 'phase') {
      const currentPhases = (item.idea as IIdeaData).relationships.phases.data.map((d) => d.id);
      const newPhases = uniq(currentPhases.concat(dropResult.id));
      updateIdea(item.id, {
        phase_ids: newPhases
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

export default flow(
  DragSource('IDEA', ideaSource, collect)
)(injectTFunc(Row));
