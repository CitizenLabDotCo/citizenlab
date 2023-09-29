import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { PreviousPathnameContext } from 'context';

// router
import { useParams, Outlet as RouterOutlet } from 'react-router-dom';

// components
import ContentContainer from 'components/ContentContainer';
import UsersShowPageMeta from './UsersShowPageMeta';
import Button from 'components/UI/Button';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useUserBySlug from 'api/users/useUserBySlug';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import UserHeader from './UserHeader';
import UserNavbar from './UserNavbar';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import Unauthorized from 'components/Unauthorized';

// utils
import { isError } from 'utils/helperUtils';

// typings
import { IUserData } from 'api/users/types';

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
  const previousPathName = useContext(PreviousPathnameContext);
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
