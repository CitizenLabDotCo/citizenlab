import * as React from 'react';
import { injectTFunc } from 'components/T/utils';
import { ITopicData } from 'services/topics';
import { flow } from 'lodash';

import { Menu } from 'semantic-ui-react';
import { DropTarget } from 'react-dnd';


interface Props {
  topic: ITopicData;
  active: boolean;
  onClick: any;
  isOver: boolean;
  canDrop: boolean;
  connectDropTarget: any;
  tFunc: ({}) => string;
}

class FilterSidebarTopicsItem extends React.Component<Props> {
  render() {
    const { topic, active, onClick, connectDropTarget, isOver, canDrop } = this.props;
    return connectDropTarget(
      <div>
        <Menu.Item
          name={this.props.tFunc(topic.attributes.title_multiloc)}
          active={active || (isOver && canDrop)}
          onClick={onClick}
        />
      </div>
    );
  }
}


const topicTarget = {
  drop(props) {
    return {
      type: 'topic',
      id: props.topic.id
    };
  },
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

export default flow([
  DropTarget('IDEA', topicTarget, collect),
  injectTFunc,
])(FilterSidebarTopicsItem);
