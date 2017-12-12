import * as React from 'react';
import { uniq } from 'lodash';
import PropTypes from 'prop-types';
// import ImPropTypes from 'react-immutable-proptypes';

// components
import { Table, Icon, Dropdown, Popup, Button, Checkbox } from 'semantic-ui-react';
import { FormattedDate } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import { injectTFunc } from 'components/T/utils';
import messages from '../messages';

import { IIdeaData, updateIdea } from 'services/ideas';
import { IIdeaStatusData } from 'services/ideaStatuses';

import { DragSource } from 'react-dnd';


// style
import styled from 'styled-components';

const StyledRow = styled.tr`
  height: 5rem;
`;


type Props = {
  idea: IIdeaData,
  tFunc: () => string,
  onDeleteIdea: () => void,
  selected?: boolean,
  onSelectIdea: () => void,
  onUnselectIdea: () => void,
  onToggleSelectIdea: () => void,
  onSingleSelectIdea: () => void;
  isDragging: boolean;
  connectDragSource: any;
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

  render() {
    const { idea, onDeleteIdea, selected, isDragging, connectDragSource } = this.props;
    const attrs = idea.attributes;
    return (
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
      updateIdea(item.id, {
        topic_ids: [dropResult.id]
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

export default DragSource('IDEA', ideaSource, collect)(injectTFunc(Row));
