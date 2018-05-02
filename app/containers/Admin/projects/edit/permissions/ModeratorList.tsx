import React from 'react';
import styled from 'styled-components';
import { isError } from 'lodash';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../../messages';

import Button from 'components/UI/Button';
import { List, Row } from 'components/admin/ResourceList';
import Avatar from 'components/Avatar';

import { isNullOrError } from 'utils/helperUtils';
import { deleteModerator } from 'services/moderators';

const StyledAvatar = styled(Avatar)`
  width: 2rem;
  height: 2rem;
`;

import { GetModeratorsChildProps } from 'resources/GetModerators';
import { InjectedIntlProps } from 'react-intl';
interface InputProps {
  projectId: string;
}
interface Props extends InputProps {
  moderators: GetModeratorsChildProps;
}

class ModeratorList extends React.PureComponent<Props & InjectedIntlProps>{
  handleDeleteClick = (projectId: string, moderatorId: string) => (event: React.FormEvent<any>) => {
    const deleteMessage = this.props.intl.formatMessage(messages.moderatorDeletionConfirmation);
    event.preventDefault();

    if (window.confirm(deleteMessage)) {
      deleteModerator(projectId, moderatorId);
    }
  }
  render() {
    const { moderators, projectId } = this.props;
    return (
      <List>
        { !isNullOrError(moderators) && moderators.map(moderator =>
          <Row key={moderator.id}>
            <StyledAvatar userId={moderator.id} size="small" />
            <p className="expand">{`${moderator.attributes.first_name} ${moderator.attributes.last_name}`}</p>
            <p className="expand">{moderator.attributes.email}</p>
            <Button
              onClick={this.handleDeleteClick(projectId, moderator.id)}
              style="text"
              circularCorners={false}
              icon="delete"
            >
              <FormattedMessage {...messages.deleteModeratorLabel} />
            </Button>
          </Row>
        )
      }
      {isError(moderators) &&
      <FormattedMessage {...messages.moderatorsNotFound} />}
    </List>
    );
  }
}

export default injectIntl<Props>(ModeratorList);
