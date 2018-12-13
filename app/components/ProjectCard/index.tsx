import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';

// components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';
import LazyImage, { Props as LazyImageProps } from 'components/LazyImage';

// services
import { getProjectUrl, getProjectIdeasUrl } from 'services/projects';
import { isProjectModerator } from 'services/permissions/roles';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetProjectImages, { GetProjectImagesChildProps } from 'resources/GetProjectImages';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import T from 'components/T';
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 5px;
  padding: 16px;
  margin-bottom: 25px;
  background: #fff;
  border-radius: 5px;
  border: solid 1px ${colors.separation};
  position: relative;

  &.archived {
    background: #f6f6f6;
  }

  ${media.biggerThanMaxTablet`
    min-height: 222px;
  `}

  ${media.smallerThanMaxTablet`
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    padding: 15px;
  `}
`;

const ProjectImageContainer =  styled.div`
  width: 190px;
  height: 190px;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 190px;
  display: flex;
  border-radius: 4px;
  margin-right: 10px;
  overflow: hidden;
  position: relative;

  ${media.smallerThanMaxTablet`
    width: 100%;
    flex-basis: 150px;
    margin: 0;
  `}
`;

const ProjectImagePlaceholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.placeholderBg};
`;

const ProjectImagePlaceholderIcon = styled(Icon) `
  height: 45px;
  fill: #fff;
`;

const ProjectImage = styled<LazyImageProps>(LazyImage)`
  width: 190px;
  height: 190px;
  position: absolute;
  top: 0;
  left: 0;
  background: #fff;

  ${media.smallerThanMaxTablet`
    width: 100%;
    height: 150px;
  `}
`;

const ProjectModeratorIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  fill: ${colors.draftYellow};
  position: absolute;
  top: 12px;
  right: 12px;

  ${media.smallerThanMaxTablet`
    top: 24px;
    right: 24px;
  `}
`;

const ProjectContent = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 10px;
  padding-bottom: 15px;
  margin-right: 40px;
  margin-left: 30px;

  ${media.smallerThanMaxTablet`
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: auto;
    margin: 0;
    padding: 15px;
    padding-top: 20px;
  `}
`;

const ArchivedLabelWrapper = styled.div`
  margin-bottom: 8px;
  display: flex;

  ${media.smallerThanMaxTablet`
    justify-content: center;
  `}
`;

const ArchivedLabel = styled.span`
  color: ${colors.text};
  font-size: ${fontSizes.xs}px;
  font-weight: 500;
  text-transform: uppercase;
  border-radius: 5px;
  padding: 6px 12px;
  background: #e1e3e7;
`;

const ProjectTitle = styled.h3`
  color: #333;
  font-size: ${fontSizes.xxl}px;
  line-height: 29px;
  font-weight: 500;
  margin: 0;
  padding: 0;
`;

const ProjectDescription = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: ${fontSizes.medium}px;
  line-height: 24px;
  font-weight: 400;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin-top: 20px;
`;

const ProjectMetaItems = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 20px;
  display: flex;
  margin-top: 25px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const IdeaCountIcon = styled(Icon)`
  height: 25px;
  width: 25px;
  fill: ${(props) => props.theme.colors.label};
  margin-right: 8px;
  margin-top: -5px;
  transition: all 100ms ease-out;
`;

const IdeaCountText = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 21px;
  transition: all 100ms ease-out;
`;

const IdeaCount = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    ${IdeaCountIcon} {
      fill: #000;
    }

    ${IdeaCountText} {
      color: #000;
      text-decoration: none;
    }
  }
`;

const ProjectButtonWrapper = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
  display: flex;
  align-items: center;
  margin-right: 20px;

  ${media.smallerThanMaxTablet`
    justify-content: center;
    margin-right: 0px;
    margin-top: 20px;
    margin-bottom: 10px;
  `}
`;

const ProjectButton = styled(Button) ``;

export interface InputProps {
  projectId: string;
}

interface DataProps {
  project: GetProjectChildProps;
  projectImages: GetProjectImagesChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class ProjectCard extends PureComponent<Props & InjectedIntlProps, State> {
  render() {
    const className = this.props['className'];
    const { authUser, project, projectImages, intl: { formatMessage } } = this.props;

    if (!isNilOrError(project)) {
      const imageUrl = (!isNilOrError(projectImages) && projectImages.length > 0 ? projectImages[0].attributes.versions.medium : null);
      const projectUrl = getProjectUrl(project);
      const projectIdeasUrl = getProjectIdeasUrl(project);
      const isArchived = (project.attributes.publication_status === 'archived');
      const ideasCount = project.attributes.ideas_count;
      const showIdeasCount = !(project.attributes.process_type === 'continuous' && project.attributes.participation_method !== 'ideation');

      return (
        <Container className={`${className} ${isArchived ? 'archived' : ''}`}>
          <ProjectImageContainer>
            <ProjectImagePlaceholder>
              <ProjectImagePlaceholderIcon name="project" />
            </ProjectImagePlaceholder>

            {imageUrl &&
              <T value={project.attributes.title_multiloc}>
                {projectTitle => (<ProjectImage src={imageUrl} alt={formatMessage(messages.imageAltText, { projectTitle })} cover />)}
              </T>
            }
          </ProjectImageContainer>

          <ProjectContent>
            {isArchived &&
              <ArchivedLabelWrapper>
                <ArchivedLabel>
                  <FormattedMessage {...messages.archived} />
                </ArchivedLabel>
              </ArchivedLabelWrapper>
            }

            <ProjectTitle>
              <T value={project.attributes.title_multiloc} />
            </ProjectTitle>

            <T value={project.attributes.description_preview_multiloc}>
              {(description) => {
                if (!isEmpty(description)) {
                  return (
                  <ProjectDescription>
                    {description}
                  </ProjectDescription>
                  );
                }

                return null;
              }}
            </T>

            {showIdeasCount && ideasCount > 0 &&
              <ProjectMetaItems>
                  <IdeaCount to={projectIdeasUrl}>
                    <IdeaCountIcon name="idea" />
                    <IdeaCountText>
                      <FormattedMessage
                        {...messages.xIdeas}
                        values={{
                          ideasCount,
                        }}
                      />
                    </IdeaCountText>
                  </IdeaCount>
              </ProjectMetaItems>
            }
          </ProjectContent>

          <ProjectButtonWrapper>
            <ProjectButton
              linkTo={projectUrl}
              text={<FormattedMessage {...messages.openProjectButton} />}
              size="2"
              style="primary"
            />
          </ProjectButtonWrapper>

          {authUser && project && project.id && isProjectModerator({ data: authUser }, project.id) && (
            <ProjectModeratorIcon name="shield" />
          )}
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render }) => <GetProject id={projectId}>{render}</GetProject>,
  projectImages: ({ projectId, render }) => <GetProjectImages projectId={projectId}>{render}</GetProjectImages>,
  authUser: <GetAuthUser />
});

const ProjectCardWithHoC = injectIntl(ProjectCard);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => {
      const props = { ...inputProps, ...dataProps };
      return <ProjectCardWithHoC {...props} />;
    }}
  </Data>
);
