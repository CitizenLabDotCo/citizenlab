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
              <ProjectHeaderImage
                src={projectHeaderImageLarge}
                id="e2e-project-header-image"
                alt=""
              />
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
