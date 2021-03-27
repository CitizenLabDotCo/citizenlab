import React from 'react';
import { IProjectData } from 'services/projects';
import { flow } from 'lodash-es';
import T from 'components/T';
import { Menu } from 'semantic-ui-react';
import { DropTarget } from 'react-dnd-cjs';

interface Props {
  project: IProjectData;
  active: boolean;
  onClick: any;
  isOver: boolean;
  canDrop: boolean;
  connectDropTarget: any;
}

class FilterSidebarProjectsItem extends React.PureComponent<Props> {
  render() {
    const {
      project,
      active,
      onClick,
      connectDropTarget,
      isOver,
      canDrop,
    } = this.props;
    return connectDropTarget(
      <div>
        <Menu.Item
          className="e2e-idea-manager-project-filter-item"
          active={active || (isOver && canDrop)}
          onClick={onClick}
        >
          <T value={project.attributes.title_multiloc} />
        </Menu.Item>
      </div>
    );
  }
}

const projectTarget = {
  drop(props) {
    return {
      type: 'project',
      id: props.project.id,
    };
  },
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

export default flow([DropTarget('IDEA', projectTarget, collect)])(
  FilterSidebarProjectsItem
);
