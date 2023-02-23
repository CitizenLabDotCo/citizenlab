import React from 'react';
import { IIdeaStatusData } from 'api/idea_statuses/types';
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

const FilterSidebarStatusesItem = ({
  status,
  active,
  onClick,
  connectDropTarget,
  isOver,
  canDrop,
}: Props) => {
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
};

const statusTarget = {
  drop({ status }: Props) {
    return {
      type: 'status',
      id: status.id,
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
