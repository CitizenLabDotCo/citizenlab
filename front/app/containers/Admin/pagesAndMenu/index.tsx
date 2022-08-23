import React from 'react';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { Outlet as RouterOutlet } from 'react-router-dom';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import Outlet from 'components/Outlet';
import styled from 'styled-components';
import PageTitle from 'components/admin/PageTitle';
import { Box } from '@citizenlab/cl2-component-library';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 3px;
  border: 1px solid #e0e0e0;
  box-sizing: border-box;
  padding: 3.5rem 4rem;
  margin-bottom: 60px;
`;

const PagesAndMenuIndex = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  // It's better to avoid using this feature flag in the core
  // https://github.com/CitizenLabDotCo/citizenlab/pull/2162#discussion_r916522447
  const customizableNavbarEnabled = useFeatureFlag({
    name: 'customizable_navbar',
  });

  return (
    <div id="e2e-pages-menu-container">
      <Outlet id="app.containers.Admin.pages-menu.index" />
      {!customizableNavbarEnabled && (
        <>
          <Box mb="20px">
            <PageTitle>{formatMessage(messages.pageHeader)}</PageTitle>
          </Box>
          <Container>
            <RouterOutlet />
          </Container>
        </>
      )}
    </div>
  );
};

export default injectIntl(PagesAndMenuIndex);
