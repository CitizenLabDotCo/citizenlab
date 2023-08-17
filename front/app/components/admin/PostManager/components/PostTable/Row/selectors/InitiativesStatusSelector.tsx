import React, { MouseEvent } from 'react';
import { Popup } from 'semantic-ui-react';
import { IInitiativeAllowedTransitions } from 'api/initiative_allowed_transitions/types';
import { IInitiativeStatusData } from 'api/initiative_statuses/types';
import T from 'components/T';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
`;

const ColorIndicator = styled.div<{ active: boolean; disabled: boolean }>`
  width: 1rem;
  height: 1rem;
  border: 1px solid ${(props) => props.color};
  border-radius: ${(props) => props.theme.borderRadius};
  margin-right: 0.5rem;
  cursor: pointer;
  margin: 0 0.25rem;
  ${(props) => (props.disabled ? 'cursor: not-allowed;' : '')}
  ${(props) => (props.active ? `background-color: ${props.color};` : '')}
`;

type Props = {
  selectedStatus?: string;
  statuses: IInitiativeStatusData[];
  onUpdateStatus: (statusId: string) => void;
  allowedTransitions: IInitiativeAllowedTransitions | null;
};

const InitiativesStatusSelector = ({
  selectedStatus,
  statuses,
  onUpdateStatus,
  allowedTransitions,
}: Props) => {
  const isActive = (statusId: string) => {
    return selectedStatus === statusId;
  };

  const isAllowed = (statusId: string) => {
    if (allowedTransitions === null) return false;

    return allowedTransitions.data.attributes[statusId] !== undefined;
  };

  const handleStatusClick = (statusId: string) => (event: MouseEvent) => {
    event.stopPropagation();
    if (isAllowed(statusId)) {
      onUpdateStatus(statusId);
    }
  };

  return (
    <Container>
      {statuses.map((status) => (
        <Popup
          key={status.id}
          basic
          trigger={
            <ColorIndicator
              disabled={!isAllowed(status.id)}
              color={status.attributes.color}
              active={isActive(status.id)}
              onClick={handleStatusClick(status.id)}
            />
          }
          content={<T value={status.attributes.title_multiloc} />}
          position="top center"
        />
      ))}
    </Container>
  );
};

export default InitiativesStatusSelector;
