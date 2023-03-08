import React from 'react';
import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { get } from 'lodash-es';
import styled from 'styled-components';
import { Menu } from 'semantic-ui-react';
import { useDrop } from 'react-dnd';
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
}

const FilterSidebarStatusesItem = ({ status, active, onClick }: Props) => {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'IDEA',
    drop: () => ({
      type: 'status',
      id: status.id,
    }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div ref={drop}>
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

export default FilterSidebarStatusesItem;
