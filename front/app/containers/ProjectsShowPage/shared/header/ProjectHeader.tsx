import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import { Button } from 'cl2-component-library';
import Image from 'components/UI/Image';

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
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

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

const HeaderImage = styled(Image)`
  width: 100%;
  height: 240px;
  margin-bottom: 30px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  overflow: hidden;

  ${media.smallerThanMinTablet`
    height: 160px;
    margin-bottom: 20px;
  `}
`;

const StyledProjectArchivedIndicator = styled(ProjectArchivedIndicator)<{
  hasHeaderImage: boolean;
}>`
  margin-top: ${(props) => (props.hasHeaderImage ? '-20px' : '0px')};
  margin-bottom: 25px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectHeader = memo<Props & InjectedIntlProps>(
  ({ projectId, className, intl: { formatMessage } }) => {
    const locale = useLocale();
    const project = useProject({ projectId });
    const authUser = useAuthUser();

    if (!isNilOrError(locale) && !isNilOrError(project)) {
      const projectHeaderImageLargeUrl = project?.attributes?.header_bg?.large;
      const userCanEditProject =
        !isNilOrError(authUser) &&
        canModerateProject(project.id, { data: authUser });

      return (
        <Container className={className || ''}>
          <ContentContainer maxWidth={maxPageWidth}>
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
            {projectHeaderImageLargeUrl && (
              <HeaderImage
                id="e2e-project-header-image"
                src={projectHeaderImageLargeUrl}
                cover={true}
                fadeIn={false}
                isLazy={false}
                placeholderBg="transparent"
                alt=""
              />
            )}
            <StyledProjectArchivedIndicator
              projectId={projectId}
              hasHeaderImage={!!projectHeaderImageLargeUrl}
            />
            <ProjectInfo projectId={projectId} />
          </ContentContainer>
        </Container>
      );
    }

    return null;
  }
);

export default injectIntl(ProjectHeader);
