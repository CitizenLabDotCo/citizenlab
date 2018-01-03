import * as React from 'react';
import { injectTFunc } from 'components/T/utils';
import { IProjectData } from 'services/projects';
import { flow } from 'lodash';

import { Menu } from 'semantic-ui-react';
import { DropTarget } from 'react-dnd';


interface Props {
  project: IProjectData;
  active: boolean;
  onClick: any;
  isOver: boolean;
  canDrop: boolean;
  connectDropTarget: any;
  tFunc: ({ }) => string;
}

class FilterSidebarProjectsItem extends React.Component<Props> {
  render() {
    const { project, active, onClick, connectDropTarget, isOver, canDrop } = this.props;
    return connectDropTarget(
      <div>
        <Menu.Item
          name={this.props.tFunc(project.attributes.title_multiloc)}
          active={active || (isOver && canDrop)}
          onClick={onClick}
        />
      </div>
    );
  }
}


const projectTarget = {
  drop(props) {
    return {
      type: 'project',
      id: props.project.id
    };
  },
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

export default flow([
  DropTarget('IDEA', projectTarget, collect),
  injectTFunc,
])(FilterSidebarProjectsItem);
