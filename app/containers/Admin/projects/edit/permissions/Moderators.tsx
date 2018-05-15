import React from 'react';
import styled from 'styled-components';

import Label from 'components/UI/Label';
import Icon from 'components/UI/Icon';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

import ModeratorList from './ModeratorList';
import UserSearch from 'components/UserSearch';

import { GetModeratorsChildProps } from 'resources/GetModerators';
import { findMembership, addMembership } from 'services/moderators';
import { fontSize } from 'utils/styleUtils';

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

const InfoText = styled.p`
  align-items: center;
  display: flex;
  font-size: ${fontSize('xs')};
  margin-bottom: 1rem;
  max-width: 650px;

  svg {
    flex: 0 0 1rem;
    margin-right: .5rem;
  }
`;

export default class Moderators extends React.PureComponent<Props>{
  render() {
    const { moderators, projectId } = this.props;
    return (
      <Container>
        <Label>
          <FormattedMessage {...messages.moderatorsSectionTitle} />
        </Label>
        <InfoText>
          <Icon name="info" />
          <FormattedMessage {...messages.moderatorsRoleExplanation} />
        </InfoText>
        <UserSearch resourceId={projectId} messages={messages} searchFunction={findMembership} addFunction={addMembership} />
        <ModeratorList moderators={moderators} projectId={projectId}/>
      </Container>
    );
  }
}
