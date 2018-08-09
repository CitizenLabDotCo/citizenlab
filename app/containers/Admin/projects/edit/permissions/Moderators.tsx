import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import ModeratorList from './ModeratorList';
import UserSearch from 'components/UserSearch';
// import Warning from 'components/UI/Warning';
import { GetModeratorsChildProps } from 'resources/GetModerators';
import { SectionTitle } from 'components/admin/Section';

interface InputProps {
  projectId: string;
}

interface Props extends InputProps {
  moderators: GetModeratorsChildProps;
}

const Container = styled.div`
  width: 100%;
  margin-bottom: 25px;
`;

// const StyledWarning = styled(Warning)`
//   margin-bottom: 15px;
// `;

export default class Moderators extends PureComponent<Props>{
  render() {
    const { moderators, projectId } = this.props;

    return (
      <Container>
        <SectionTitle>
          <FormattedMessage {...messages.moderatorsSectionTitle} />
        </SectionTitle>
        {/* <StyledWarning text={<FormattedMessage {...messages.moderatorsRoleExplanation} />} /> */}
        <UserSearch projectId={projectId} moderators={moderators} />
        <ModeratorList moderators={moderators} projectId={projectId}/>
      </Container>
    );
  }
}
