import React from 'react';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

import Button from 'components/UI/Button';
import { List, Row } from 'components/admin/ResourceList';
import Avatar from 'components/Avatar';

import { IUserData } from 'services/users';

const StyledAvatar = styled(Avatar)`
  width: 2rem;
  height: 2rem;
`;

interface Props {
  moderators: IUserData[] | null;
}

export default class ModeratorList extends React.PureComponent<Props>{
  render() {
    const { moderators } = this.props;
    return (
      <List>
        { moderators && moderators.map(moderator =>
          <Row key={moderator.id}>
            <StyledAvatar userId={moderator.id} size="small" />
            <div className="expand">{`${moderator.attributes.first_name} ${moderator.attributes.last_name}`}</div>
            <div className="expand">{moderator.attributes.email}</div>
            <Button
              style="text"
              circularCorners={false}
              icon="delete"
            >
              <FormattedMessage {...messages.deleteModeratorLabel} />
            </Button>
          </Row>
        )}
      </List>
    );
  }
}
