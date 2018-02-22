import * as React from 'react';
import { IIdeaStatusData } from 'services/ideaStatuses';
import { flow } from 'lodash';
import styled from 'styled-components';
import { Menu } from 'semantic-ui-react';
import { DropTarget } from 'react-dnd';
import T from 'components/T';

const ItemWrapper = styled.div`
  display: flex;
  text-transform: capitalize;
`;

const ColorIndicator = styled<any,'div'>('div')`
  width: 1rem;
  height: 1rem;
  background-color: ${props => props.color};
  border-radius: 3px;
  margin-right: 0.5rem;
`;

interface Props {
  status: IIdeaStatusData;
  active: boolean;
  onClick: any;
  isOver: boolean;
  canDrop: boolean;
  connectDropTarget: any;
}

class FilterSidebarStatusesItem extends React.Component<Props> {
  render() {
    const { status, active, onClick, connectDropTarget, isOver, canDrop } = this.props;

    return connectDropTarget(
      <div>
        <Menu.Item
          active={active || (isOver && canDrop)}
          onClick={onClick}
        >
          <ItemWrapper>
            <ColorIndicator color={status.attributes.color} />
            <T value={status.attributes.title_multiloc} />
          </ItemWrapper>
        </Menu.Item>
      </div>
    );
  }
}


const statusTarget = {
  drop(props) {
    return {
      type: 'ideaStatus',
      id: props.status.id
    };
  },
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

export default flow([
  DropTarget('IDEA', statusTarget, collect),
])(FilterSidebarStatusesItem);
