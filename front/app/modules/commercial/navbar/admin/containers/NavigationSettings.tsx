import React from 'react';
import { Box } from 'cl2-component-library';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import VisibleNavbarItemList from './VisibleNavbarItemList';
import HiddenNavbarItemList from './HiddenNavbarItemList';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const PageTitle = styled.div`
  font-size: 25px;
  font-weight: 700;
  color: ${colors.adminTextColor};
  margin-bottom: 28px;
`;

const PageSubtitle = styled.div`
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: ${colors.label};
  margin-bottom: 58px;
`;

const NavigationSettings = () => (
  <>
    <PageTitle>
      <FormattedMessage {...messages.pageTitle} />
    </PageTitle>

    <PageSubtitle>
      <FormattedMessage {...messages.pageSubtitle} />
    </PageSubtitle>

    <Box mb="44px">
      <VisibleNavbarItemList />
    </Box>

    <HiddenNavbarItemList />
  </>
);

export default injectIntl(NavigationSettings);
