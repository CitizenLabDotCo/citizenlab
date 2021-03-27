import React, { PureComponent } from 'react';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import styled from 'styled-components';
import PostManager from 'components/admin/PostManager';

const StyledDiv = styled.div`
  margin-bottom: 30px;
`;

export default class InitiativesManagePage extends PureComponent {
  render() {
    return (
      <>
        <StyledDiv>
          <SectionTitle>
            <FormattedMessage {...messages.titleManageTab} />
          </SectionTitle>
          <SectionDescription>
            <FormattedMessage {...messages.subtitleManageTab} />
          </SectionDescription>
        </StyledDiv>

        <PostManager
          type="Initiatives"
          visibleFilterMenus={['statuses', 'topics']}
        />
      </>
    );
  }
}
