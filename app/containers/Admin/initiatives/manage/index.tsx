import React, { PureComponent } from 'react';
import { SectionTitle, SectionSubtitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import styled from 'styled-components';
import PostManager from 'components/admin/PostManager';

const StyledDiv = styled.div`
  margin-bottom: 30px;
`;

export default class InitiativesSettingsPage extends PureComponent {

  render() {
    return (
      <>
        <StyledDiv>
          <SectionTitle>
            <FormattedMessage {...messages.titleManageTab} />
          </SectionTitle>
          <SectionSubtitle>
            <FormattedMessage {...messages.subtitleManageTab} />
          </SectionSubtitle>
        </StyledDiv>

        <PostManager
          type="Initiatives"
          visibleFilterMenus={['statuses', 'topics']}
        />
      </>
    );
  }
}
