import React, { MouseEvent } from 'react';

import { Text, Tooltip } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';

import { ManagerType } from 'components/admin/PostManager';
import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../../messages';

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
  ${(props) => (props.active ? `background-color: ${props.color};` : '')}
  ${(props) => (props.disabled ? 'cursor: not-allowed;' : '')}
   ${(props) => (props.disabled ? 'pointer-events: none;' : '')}
`;

type Props = {
  selectedStatus?: string;
  statuses: IIdeaStatusData[];
  onUpdateStatus: (statusId: string) => void;
  type: ManagerType;
};

class IdeasStatusSelector extends React.PureComponent<Props> {
  isActive = (statusId: string) => {
    return this.props.selectedStatus === statusId;
  };

  handleStatusClick = (statusId: string) => (event: MouseEvent) => {
    event.stopPropagation();
    this.props.onUpdateStatus(statusId);
  };

  render() {
    const { statuses, type } = this.props;
    return (
      <Container>
        {statuses.map((status) => {
          // Prescreening is a special status that can be configured in a project,
          // so we don't want to show it in a context without projects to not get status conflicts
          // (e.g. the general input manager has ideas from all projects,
          // including those without the prescreening status filter)
          if (
            type === 'AllIdeas' &&
            status.attributes.code === 'prescreening'
          ) {
            return null;
          }

          return (
            <Tooltip
              key={status.id}
              content={
                <div>
                  <Text fontWeight="bold" m="0px">
                    <T value={status.attributes.title_multiloc} />
                  </Text>
                  {!status.attributes.can_manually_transition_to && (
                    <FormattedMessage
                      {...messages.automatedStatusTooltipText}
                    />
                  )}
                </div>
              }
            >
              <ColorIndicator
                color={status.attributes.color}
                active={this.isActive(status.id)}
                onClick={this.handleStatusClick(status.id)}
                disabled={!status.attributes.can_manually_transition_to}
              />
            </Tooltip>
          );
        })}
      </Container>
    );
  }
}

export default IdeasStatusSelector;
