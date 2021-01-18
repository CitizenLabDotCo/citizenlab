import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import { Button } from 'cl2-component-library';

// hooks
import useLocale from 'hooks/useLocale';
import useProject from 'hooks/useProject';
import useAuthUser from 'hooks/useAuthUser';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from 'containers/ProjectsShowPage/messages';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';

const Container = styled.div`
  padding-top: 30px;
  padding-bottom: 65px;
  background: #fff;
  position: relative;
  z-index: 2;

  ${media.smallerThanMinTablet`
    padding-top: 30px;
    padding-bottom: 35px;
  `}
`;

const EditButton = styled(Button)`
  display: table;
  margin: 0 0 10px auto;

  ${isRtl`
    margin: 0 0 auto 10px;
  `}
`;

const ProjectHeaderImage = styled.img<{ src: string }>`
  width: 100%;
  height: 240px;
  margin-bottom: 30px;
  border-radius: ${(props: any) => props.theme.borderRadius};

  ${media.smallerThanMinTablet`
    height: 160px;
    margin-bottom: 20px;
  `}

  object-fit: cover;
`;

const ProjectHeaderImageFallback = styled.div`
  width: 100%;
  height: 240px;
  margin-bottom: 30px;
  position: relative;
  border-radius: ${(props: any) => props.theme.borderRadius};
  overflow: hidden;
  ${media.smallerThanMinTablet`
    height: 160px;
    margin-bottom: 20px;
  `}
`;

const FallbackImage = styled.div<{ src: string }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: url(${(props: any) => props.src});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  overflow: hidden;
`;

const StyledProjectArchivedIndicator = styled(ProjectArchivedIndicator)<{
  hasHeaderImage: boolean;
}>`
  margin-top: ${(props) => (props.hasHeaderImage ? '-20px' : '0px')};
  margin-bottom: 25px;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const StyledProjectInfo = styled(ProjectInfo)``;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectHeader = memo<Props & InjectedIntlProps>(
  ({ projectId, className, intl: { formatMessage } }) => {
    const locale = useLocale();
    const project = useProject({ projectId });
    const authUser = useAuthUser();

    const getProjectImage = (projectImageUrl: string | null) => {
      if (projectImageUrl) {
        // real img needed for a11y (alt attribute)
        // object-fit is not supported pre 2014: https://caniuse.com/object-fit
        // in that case, we hide (aria-hidden) the fallback div
        return window['CSS'] && CSS.supports('object-fit: cover') ? (
          <ProjectHeaderImage
            src={projectImageUrl}
            id="e2e-project-header-image"
            alt=""
          />
        ) : (
          <ProjectHeaderImageFallback aria-hidden>
            <FallbackImage
              src={projectImageUrl}
              id="e2e-project-header-image"
            />
          </ProjectHeaderImageFallback>
        );
      }

      return null;
    };

    if (!isNilOrError(locale) && !isNilOrError(project)) {
      const projectHeaderImageLargeUrl = project?.attributes?.header_bg?.large;
      const userCanEditProject =
        !isNilOrError(authUser) &&
        canModerateProject(project.id, { data: authUser });
      const projectImage = getProjectImage(projectHeaderImageLargeUrl);

      return (
        <Container className={className || ''}>
          <ContentContainer>
            {userCanEditProject && (
              <EditButton
                icon="edit"
                locale={locale}
                linkTo={`/admin/projects/${project.id}/edit`}
                buttonStyle="secondary"
                padding="5px 8px"
              >
                {formatMessage(messages.editProject)}
              </EditButton>
            )}
            {projectImage}
            <StyledProjectArchivedIndicator
              projectId={projectId}
              hasHeaderImage={!!projectImage}
            />
            <StyledProjectInfo projectId={projectId} />
          </ContentContainer>
        </Container>
      );
    }

    return null;
  }
);

export default injectIntl(ProjectHeader);
