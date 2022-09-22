import { SectionDescription, SectionTitle } from 'components/admin/Section';
import React, { PureComponent } from 'react';

import PostManager, { TFilterMenu } from 'components/admin/PostManager';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import messages from '../messages';

const StyledDiv = styled.div`
  margin-bottom: 30px;
`;

export default class InitiativesManagePage extends PureComponent {
  render() {
    const defaultFilterMenu = 'statuses';
    const visibleFilterMenus: TFilterMenu[] = [defaultFilterMenu, 'topics'];
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
          visibleFilterMenus={visibleFilterMenus}
          defaultFilterMenu={defaultFilterMenu}
        />
      </>
    );
  }
}
