import React, { MouseEvent } from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { Popup } from 'semantic-ui-react';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';

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
`;

type Props = {
  selectedStatus?: string;
  statuses: IIdeaStatusData[];
  onUpdateStatus: (statusId: string) => void;
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
    const { statuses } = this.props;
    return (
      <Container>
        {statuses.map((status) => (
          <Popup
            key={status.id}
            basic
            trigger={
              <ColorIndicator
                color={status.attributes.color}
                active={this.isActive(status.id)}
                onClick={this.handleStatusClick(status.id)}
                disabled={!status.attributes.can_manually_transition_to}
              />
            }
            content={
              <div>
                <Text fontWeight="bold" m="0px">
                  <T value={status.attributes.title_multiloc} />
                </Text>
                <FormattedMessage {...messages.automatedStatusTooltipText} />
              </div>
            }
            position="top center"
          />
        ))}
      </Container>
    );
  }
}

export default IdeasStatusSelector;
