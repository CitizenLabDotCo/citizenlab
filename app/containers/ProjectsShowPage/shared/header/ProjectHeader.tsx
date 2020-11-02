import React, { memo, useCallback, useState, FormEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { canModerate } from 'services/permissions/rules/projectPermissions';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import ProjectSharingModal from './ProjectSharingModal';
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

const ProjectHeaderImageContainer = styled.div`
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

const EditButton = styled(Button)`
  display: table;
  margin: 0 0 10px auto;

  ${isRtl`
    margin: 0 0 auto 10px;
  `}
`;

const ShareButton = styled(Button)`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: none;

  ${media.smallerThanMinTablet`
    display: block;
  `}
`;

const ProjectHeaderImage = styled.div<{ src: string }>`
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

    const [shareModalOpened, setShareModalOpened] = useState(false);

    const openShareModal = useCallback((event: FormEvent) => {
      event.preventDefault();
      setShareModalOpened(true);
    }, []);

    const closeShareModal = useCallback(() => {
      setShareModalOpened(false);
    }, []);

    if (!isNilOrError(locale) && !isNilOrError(project)) {
      const projectHeaderImageLarge = project?.attributes?.header_bg?.large;
      const userCanEditProject =
        !isNilOrError(authUser) &&
        canModerate(project.id, { data: authUser.data });

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
            {projectHeaderImageLarge && projectHeaderImageLarge.length > 1 && (
              <ProjectHeaderImageContainer>
                <ShareButton
                  locale={locale}
                  icon="share"
                  onClick={openShareModal}
                  buttonStyle="white"
                  iconColor="#000"
                  textColor="#000"
                  bgColor="rgba(255, 255, 255, 0.92)"
                  borderColor="#ccc"
                  padding="5px 8px"
                >
                  {formatMessage(messages.share)}
                </ShareButton>
                <ProjectHeaderImage
                  src={projectHeaderImageLarge}
                  id="e2e-project-header-image"
                />
              </ProjectHeaderImageContainer>
            )}
            <StyledProjectArchivedIndicator
              projectId={projectId}
              hasHeaderImage={!!projectHeaderImageLarge}
            />
            <StyledProjectInfo projectId={projectId} />
          </ContentContainer>
          <ProjectSharingModal
            projectId={project.id}
            opened={shareModalOpened}
            close={closeShareModal}
          />
        </Container>
      );
    }

    return null;
  }
);

export default injectIntl(ProjectHeader);
