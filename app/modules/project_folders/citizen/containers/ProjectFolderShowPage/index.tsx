import React, { memo } from 'react';
import { isError, isUndefined } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';

// components
import ProjectFolderShowPageMeta from './ProjectFolderShowPageMeta';
import ProjectFolderHeader from './ProjectFolderHeader';
import ProjectFolderDescription from './ProjectFolderDescription';
import ProjectFolderProjectCards from './ProjectFolderProjectCards';
import Button from 'components/UI/Button';
import { Spinner } from 'cl2-component-library';
import ContentContainer from 'components/ContentContainer';

// hooks
import useLocale from 'hooks/useLocale';
import useTenant from 'hooks/useTenant';
import useProjectFolder from 'hooks/useProjectFolder';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';

const Container = styled.main`
  flex: 1 0 auto;
  height: 100%;
  min-height: calc(100vh - ${(props) => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  background: #fff;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
    background: ${colors.background};
  `}

  ${media.biggerThanMinTablet`
    &.loaded {
      min-height: 900px;
    }
  `}
`;

const Loading = styled.div`
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledContentContainer = styled(ContentContainer)`
  border: solid 1px red;
`;

const StyledProjectFolderHeader = styled(ProjectFolderHeader)`
  flex: 1;
  margin-bottom: 30px;
`;

const Content = styled.div`
  display: flex;
`;

const StyledProjectFolderDescription = styled(ProjectFolderDescription)`
  flex: 1;
`;

const StyledProjectFolderProjectCards = styled(ProjectFolderProjectCards)`
  flex: 0 0 894px;
  width: 894px;
  padding: 20px;
  background: ${colors.background};
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

const NotFoundWrapper = styled.div`
  height: 100%;
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  font-size: ${fontSizes.large}px;
  color: ${colors.label};
`;

const ProjectFolderShowPage = memo<WithRouterProps>(({ params: { slug } }) => {
  const locale = useLocale();
  const tenant = useTenant();
  const projectFolder = useProjectFolder({ projectFolderSlug: slug });

  const folderNotFound = isError(projectFolder);
  const loading =
    isUndefined(locale) || isUndefined(tenant) || isUndefined(projectFolder);

  return (
    <>
      <ProjectFolderShowPageMeta projectFolderSlug={slug} />
      <Container
        className={`${!loading ? 'loaded' : 'loading'} e2e-folder-page`}
      >
        {folderNotFound ? (
          <NotFoundWrapper>
            <p>
              <FormattedMessage {...messages.noFolderFoundHere} />
            </p>
            <Button
              linkTo="/projects"
              text={<FormattedMessage {...messages.goBackToList} />}
              icon="arrow-back"
            />
          </NotFoundWrapper>
        ) : loading ? (
          <Loading>
            <Spinner />
          </Loading>
        ) : !isNilOrError(projectFolder) ? (
          <StyledContentContainer maxWidth={1774}>
            <StyledProjectFolderHeader projectFolderId={projectFolder.id} />
            <Content>
              <StyledProjectFolderDescription
                projectFolderId={projectFolder.id}
              />
              <StyledProjectFolderProjectCards
                projectFolderId={projectFolder.id}
              />
            </Content>
          </StyledContentContainer>
        ) : null}
      </Container>
    </>
  );
});

export default withRouter(ProjectFolderShowPage);
