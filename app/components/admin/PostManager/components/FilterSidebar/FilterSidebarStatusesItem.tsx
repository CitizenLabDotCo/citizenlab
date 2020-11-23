import React from 'react';
import { IIdeaStatusData } from 'services/ideaStatuses';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { flow, get } from 'lodash-es';
import styled from 'styled-components';
import { Menu } from 'semantic-ui-react';
import { DropTarget } from 'react-dnd-cjs';
import T from 'components/T';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

const ItemWrapper = styled.div`
  display: flex;
`;

const ColorIndicator = styled.div`
  width: 1rem;
  height: 1rem;
  background-color: ${(props) => props.color};
  border-radius: ${(props) => props.theme.borderRadius};
  margin-right: 0.5rem;
`;

const StatusText = styled.div`
  &:first-letter {
    text-transform: uppercase;
  }
`;

const StyledText = styled.span`
  font-weight: 300;
`;

interface Props {
  status: IIdeaStatusData | IInitiativeStatusData;
  active: boolean;
  onClick: any;
  isOver: boolean;
  canDrop: boolean;
  connectDropTarget: any;
}

class FilterSidebarStatusesItem extends React.PureComponent<Props> {
  render() {
    const {
      status,
      active,
      onClick,
      connectDropTarget,
      isOver,
      canDrop,
    } = this.props;

    return connectDropTarget(
      <div>
        <Menu.Item active={active || (isOver && canDrop)} onClick={onClick}>
          <ItemWrapper>
            <ColorIndicator color={status.attributes.color} />
            <div>
              <StatusText>
                <T value={status.attributes.title_multiloc} />
              </StatusText>
              {get(status, 'attributes.transition_type') === 'automatic' && (
                <StyledText>
                  &nbsp;
                  <FormattedMessage {...messages.automatic} />
                </StyledText>
              )}
            </div>
          </ItemWrapper>
        </Menu.Item>
      </div>
    );
  }
}

const statusTarget = {
  drop(props) {
    return {
      type: 'status',
      id: props.status.id,
    };
  },
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

export default flow([DropTarget('IDEA', statusTarget, collect)])(
  FilterSidebarStatusesItem
);
