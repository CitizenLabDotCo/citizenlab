import React from 'react';

import { media, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useUserBySlug from 'api/users/useUserBySlug';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import ContentContainer from 'components/ContentContainer';
import Unauthorized from 'components/Unauthorized';

import { useParams, Outlet as RouterOutlet } from 'utils/router';

import UserHeader from './UserHeader';
import UserNavbar from './UserNavbar';
import UsersShowPageMeta from './UsersShowPageMeta';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledContentContainer = styled(ContentContainer)`
  flex: 1 1 auto;
  padding-top: 36px;
  padding-bottom: 100px;
  background: ${colors.background};
  align-items: center;
  min-height: 100vh;

  ${media.phone`
    padding-top: 50px;
  `}
`;

const UsersShowPage = () => {
  const { userSlug } = useParams({ from: '/$locale/profile/$userSlug' });
  const { data: user } = useUserBySlug(userSlug);

  if (!user) return null;

  if (!user.data.attributes.registration_completed_at) {
    return <Unauthorized />;
  }

  return (
    <>
      <UsersShowPageMeta user={user.data} />
      <main id="e2e-usersshowpage">
        <Container>
          <UserHeader userSlug={user.data.attributes.slug} />
          <UserNavbar user={user.data} />
          <StyledContentContainer maxWidth={maxPageWidth}>
            <RouterOutlet />
          </StyledContentContainer>
        </Container>
      </main>
    </>
  );
};

export default UsersShowPage;
