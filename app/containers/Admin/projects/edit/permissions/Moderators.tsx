import React from 'react';
import styled from 'styled-components';

import Label from 'components/UI/Label';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

import ModeratorList from './ModeratorList';
import UserSearch from 'components/UserSearch';

import { GetModeratorsChildProps } from 'resources/GetModerators';
import { findMembership, addMembership } from 'services/moderators';

interface InputProps {
  projectId: string;
}

interface Props extends InputProps {
  moderators: GetModeratorsChildProps;
}

const Container = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

export default class Moderators extends React.PureComponent<Props>{
  render() {
    const { moderators, projectId } = this.props;
    return (
      <Container>
        <Label>
          <FormattedMessage {...messages.moderatorsSectionTitle} />
        </Label>
        <UserSearch resourceId={projectId} messages={messages} searchFunction={findMembership} addFunction={addMembership} />
        <ModeratorList moderators={moderators} projectId={projectId}/>
      </Container>
    );
  }
}
