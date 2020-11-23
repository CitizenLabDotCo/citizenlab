import React from 'react';
import { ITopicData } from 'services/topics';
import { flow } from 'lodash-es';
import T from 'components/T';
import { Menu } from 'semantic-ui-react';
import { DropTarget } from 'react-dnd-cjs';

interface Props {
  topic: ITopicData;
  active: boolean;
  onClick: any;
  isOver: boolean;
  canDrop: boolean;
  connectDropTarget: any;
}

class FilterSidebarTopicsItem extends React.PureComponent<Props> {
  render() {
    const {
      topic,
      active,
      onClick,
      connectDropTarget,
      isOver,
      canDrop,
    } = this.props;
    return connectDropTarget(
      <div>
        <Menu.Item active={active || (isOver && canDrop)} onClick={onClick}>
          <T value={topic.attributes.title_multiloc} />
        </Menu.Item>
      </div>
    );
  }
}

const topicTarget = {
  drop(props) {
    return {
      type: 'topic',
      id: props.topic.id,
    };
  },
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

export default flow([DropTarget('IDEA', topicTarget, collect)])(
  FilterSidebarTopicsItem
);
