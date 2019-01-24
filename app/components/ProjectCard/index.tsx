import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';

// components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';
import LazyImage, { Props as LazyImageProps } from 'components/LazyImage';
import AvatarBubbles from 'components/AvatarBubbles';

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
import { rgba, darken } from 'polished';

const Container = styled.div`
  width: 100%;
  height: 449px;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  border-radius: 5px;
  margin-bottom: 25px;
  position: relative;
  cursor: pointer;
  background: #fff;
  border-radius: 5px;
  /* border: solid 1px ${colors.separation}; */
  box-shadow: 1px 0 2px 0 rgba(0, 0, 0, .05);
  transition: all 200ms ease;

  &.archived {
    background: #f6f6f6;
  }

  &:hover {
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, .1);
    transform: translate(0px, -2px);
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
  width: 573px;
  height: 449px;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 573px;
  display: flex;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  margin-right: 10px;
  overflow: hidden;
  position: relative;

  /*
  ${media.smallerThanMaxTablet`
    width: 100%;
    flex-basis: 150px;
    margin: 0;
  `}
  */
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
  width: 573px;
  height: 449px;
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
  margin-top: 20px;
  margin-bottom: 20px;
  margin-left: 68px;
  margin-right: 32px;

  /*
  ${media.smallerThanMaxTablet`
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: auto;
    margin: 0;
    padding: 15px;
    padding-top: 20px;
  `}
  */
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 22px;
  border-bottom: solid 1px #e8e8e8;
`;

const ContentHeaderLeft = styled.div``;

const ContentHeaderRight = styled.div``;

const Countdown = styled.div``;

const TimeRemaining = styled.div`
  color: ${({ theme }) => theme.colorMain};
  font-size: ${fontSizes.small};
  font-weight: 400;
  margin-bottom: 5px;
`;

const ProgressBar = styled.div`
  width: 112px;
  height: 5px;
  border-radius: 5px;
  background: #d6dade;
`;

const ProgressBarOverlay: any = styled.div`
  width: ${(props: any) => props.progress}%;
  height: 100%;
  border-radius: 5px;
  background: #fc3428;
`;

const ProjectLabel = styled.div`
  color: ${({ theme }) => theme.colorSecondary};
  font-size: ${fontSizes.small};
  font-weight: 400;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 9px;
  padding-bottom: 9px;
  border-radius: 5px;
  background: ${({ theme }) => rgba(theme.colorSecondary, 0.05)};
  transition: all 200ms ease;
  cursor: pointer;

  &:hover {
    color: #448943;
    background: #DFEADF;

    color: ${darken(0.15, colors.clBlueDark)};
  }
`;

const ContentBody = styled.div`
  width: 100%;
  max-width: 320px;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

// const ProjectTitle = styled.h2``;

// const ProjectDescription = styled.p``;

const ContentFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 22px;
  border-top: solid 1px #e8e8e8;
`;

const ContentFooterLeft = styled.div``;

const ContentFooterRight = styled.div``;

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
  color: ${({ theme }) => theme.colorMain};
  font-size: ${fontSizes.xl}px;
  line-height: normal;
  font-weight: 500;
  margin: 0;
  padding: 0;
`;

const ProjectDescription = styled.div`
  color: ${(props) => props.theme.colors.secondaryText};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 300;
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

const ProjectButton = styled(Button)``;

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

      const timeRemaining = '5 days';

      return (
        <Container className={`${className} e2e-project-card ${isArchived ? 'archived' : ''}`}>
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
            <ContentHeader>
              <ContentHeaderLeft>
                <Countdown>
                  <TimeRemaining>
                  <FormattedMessage {...messages.remaining} values={{ timeRemaining }} />
                  </TimeRemaining>
                  <ProgressBar>
                    <ProgressBarOverlay progress={80} />
                  </ProgressBar>
                </Countdown>

                {isArchived &&
                  <ArchivedLabelWrapper>
                    <ArchivedLabel>
                      <FormattedMessage {...messages.archived} />
                    </ArchivedLabel>
                  </ArchivedLabelWrapper>
                }
              </ContentHeaderLeft>

              <ContentHeaderRight>
                <ProjectLabel>
                  <span>Allocate your budget</span>
                </ProjectLabel>
              </ContentHeaderRight>
            </ContentHeader>

            <ContentBody>
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
            </ContentBody>

            <ContentFooter>
              <ContentFooterLeft>
                <AvatarBubbles
                  size={25}
                  context={{
                    type: 'project',
                    id: project.id
                  }}
                />
              </ContentFooterLeft>

              <ContentFooterRight>
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
              </ContentFooterRight>
            </ContentFooter>
          </ProjectContent>

          {/*
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
          */}
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
