import React from 'react';

import { media, colors } from '@citizenlab/cl2-component-library';
import { useParams, Outlet as RouterOutlet } from 'react-router-dom';
import styled from 'styled-components';

import useUserBySlug from 'api/users/useUserBySlug';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import ContentContainer from 'components/ContentContainer';
import Unauthorized from 'components/Unauthorized';

import UserHeader from './UserHeader';
import UserNavbar from './UserNavbar';
import UsersShowPageMeta from './UsersShowPageMeta';

const Main = styled.main`
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
  const { userSlug } = useParams() as { userSlug: string };
  const { data: user } = useUserBySlug(userSlug);

  if (!user) return null;

  if (!user.data.attributes.registration_completed_at) {
    return <Unauthorized />;
  }

  return (
    <>
      <UsersShowPageMeta user={user.data} />
      <Main id="e2e-usersshowpage">
        <UserHeader userSlug={user.data.attributes.slug} />
        <UserNavbar user={user.data} />
        <StyledContentContainer maxWidth={maxPageWidth}>
          <RouterOutlet />
        </StyledContentContainer>
      </Main>
    </>
  );
};

export default UsersShowPage;
