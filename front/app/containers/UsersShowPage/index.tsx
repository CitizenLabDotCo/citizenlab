import React, { useContext } from 'react';

import { media, colors, fontSizes } from '@citizenlab/cl2-component-library';
import { PreviousPathnameContext } from 'context';
import { Helmet } from 'react-helmet';
import { useParams, Outlet as RouterOutlet } from 'react-router-dom';
import { RouteType } from 'routes';
import styled from 'styled-components';

import { IUserData } from 'api/users/types';
import useUserBySlug from 'api/users/useUserBySlug';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import ContentContainer from 'components/ContentContainer';
import Button from 'components/UI/Button';
import Unauthorized from 'components/Unauthorized';

import { useIntl } from 'utils/cl-intl';
import { isError } from 'utils/helperUtils';

import messages from './messages';
import UserHeader from './UserHeader';
import UserNavbar from './UserNavbar';
import UsersShowPageMeta from './UsersShowPageMeta';

const NotFoundContainer = styled.main`
  min-height: calc(100vh - ${(props) => props.theme.menuHeight}px - 1px - 4rem);
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 4rem;
  font-size: ${fontSizes.l}px;
  color: ${colors.textSecondary};
`;

const Container = styled.main`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: ${colors.background};

  ${media.tablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
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

interface InnerProps {
  className?: string;
  user: IUserData;
}

export const UsersShowPage = ({ className, user }: InnerProps) => (
  <>
    <UsersShowPageMeta user={user} />
    <Container id="e2e-usersshowpage" className={className}>
      <UserHeader userSlug={user.attributes.slug} />

      <UserNavbar user={user} />

      <StyledContentContainer maxWidth={maxPageWidth}>
        <RouterOutlet />
      </StyledContentContainer>
    </Container>
  </>
);

interface Props {
  className?: string;
}

const UsersShowPageOuter = ({ className }: Props) => {
  const { userSlug } = useParams() as { userSlug: string };
  const { formatMessage } = useIntl();
  const { data: user } = useUserBySlug(userSlug);
  const previousPathName = useContext(PreviousPathnameContext) as RouteType;

  if (!user) return null;

  if (isError(user)) {
    return (
      <NotFoundContainer className={className || ''}>
        <Helmet>
          <meta name="prerender-status-code" content="404" />
        </Helmet>
        <p>{formatMessage(messages.user404NotFound)}</p>
        <Button
          linkTo={previousPathName || '/'}
          text={formatMessage(messages.goBackToPreviousPage)}
          icon="arrow-left"
        />
      </NotFoundContainer>
    );
  }

  if (!user.data.attributes.registration_completed_at) {
    return <Unauthorized />;
  }

  return <UsersShowPage className={className} user={user.data} />;
};

export default UsersShowPageOuter;
