import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';
import bowser from 'bowser';

// router
import Link from 'utils/cl-router/Link';

// components
import Icon from 'components/UI/Icon';
import LazyImage from 'components/LazyImage';

// services
import { getProjectUrl } from 'services/projects';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetProjectImages, { GetProjectImagesChildProps } from 'resources/GetProjectImages';

// i18n
import T from 'components/T';
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from './messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled, { withTheme } from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled(Link)`
  width: calc(33% - 12px);
  min-height: 560px;
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
  position: relative;
  cursor: pointer;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.06);

  &.large {
    width: 100%;
    min-height: 450px;
    flex-direction: row;
    align-items: stretch;
    justify-content: space-between;

    ${media.smallerThanMinTablet`
      width: 100%;
    `}
  }

  &.medium {
    width: calc(50% - 13px);
    min-height: 580px;
    padding-left: 30px;
    padding-right: 30px;

    ${media.smallerThanMinTablet`
      width: 100%;
    `}
  }

  &.small {
    &.threecolumns {
      ${media.smallerThanMaxTablet`
        width: calc(50% - 13px);
      `}

      ${media.smallerThanMinTablet`
        width: 100%;
        min-height: 460px;
      `}
    }

    ${media.smallerThanMinTablet`
      min-height: 400px;
    `}
  }

  &.small,
  &.medium {
    padding-top: 20px;
    padding-bottom: 30px;
  }

  &.desktop {
    transition: all 200ms ease;

    &:hover {
      box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.12);
      transform: translate(0px, -2px);
    }

    &:focus {
      box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.3);
      transform: translate(0px, -2px);
    }
  }

  ${media.smallerThanMinTablet`
    width: 100%;
    min-height: 460px;
  `}
`;

const ProjectImageContainer =  styled.div`
  width: 100%;
  height: 254px;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 254px;
  display: flex;
  margin-right: 10px;
  overflow: hidden;
  position: relative;

  &.large {
    width: 50%;
    height: 100%;
    flex-basis: 50%;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
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

const ProjectImage = styled(LazyImage)`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: #fff;
`;

const ProjectContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  &.large {
    margin-top: 18px;
    margin-bottom: 35px;
    margin-left: 68px;
    margin-right: 32px;

    ${media.smallerThanMaxTablet`
      margin-left: 20px;
      margin-right: 20px;
    `}
  }

  &.small {
    padding-left: 30px;
    padding-right: 30px;

    ${media.smallerThanMinTablet`
      padding-left: 20px;
      padding-right: 20px;
    `};
  }
`;

const ContentHeaderHeight = 39;
const ContentHeaderBottomMargin = 13;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;

  &.noContent {
    ${media.biggerThanMinTablet`
      height: ${ContentHeaderHeight + ContentHeaderBottomMargin}px;
    `}
  }

  &.hasContent {
    margin-bottom: ${ContentHeaderBottomMargin}px;

    &.large {
      margin-bottom: 0px;
      padding-bottom: ${ContentHeaderBottomMargin}px;
      border-bottom: solid 1px #e8e8e8;
    }
  }

  &.small {
    padding-left: 30px;
    padding-right: 30px;

    ${media.smallerThanMinTablet`
      padding-left: 20px;
      padding-right: 20px;
    `}

    ${media.smallPhone`
      padding-left: 10px;
      padding-right: 10px;
    `}
  }
`;

const ContentBody = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding-top: 20px;

  &.large {
    max-width: 400px;
    justify-content: center;
  }
`;

const ProjectTitle = styled.h3`
  line-height: normal;
  font-weight: 500;
  font-size: ${fontSizes.xl}px;
  color: ${({ theme }) => theme.colorText};
  margin: 0;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const ProjectDescription = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 300;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin-top: 15px;
`;

const MapIcon = styled(Icon)`
  width: 27px;
  height: 21px;
  fill: ${({ theme }) => theme.colorSecondary};
  margin-right: 10px;
`;

const MapIconDescription = styled.span`
  font-weight: bold;
  margin-bottom: -2px;
  color: ${({ theme }) => theme.colorSecondary};
`;

export interface InputProps {
  projectId: string;
  size: 'small' | 'medium' | 'large';
  layout?: 'dynamic' | 'threecolumns';
  className?: string;
}

interface DataProps {
  project: GetProjectChildProps;
  projectImages: GetProjectImagesChildProps;
}

interface Props extends InputProps, DataProps {
  theme?: any;
}

class ProjectCard extends PureComponent<Props & InjectedIntlProps> {
  handleProjectCardOnClick = (projectId: string) => () => {
    trackEventByName(tracks.clickOnProjectCard, { extra: { projectId } });
  }

  handleCTAOnClick = (projectId: string) => () => {
    trackEventByName(tracks.clickOnProjectCardCTA, { extra: { projectId } });
  }

  handleProjectTitleOnClick = (projectId: string) => () => {
    trackEventByName(tracks.clickOnProjectTitle, { extra: { projectId } });
  }

  render() {
    const { project, size, projectImages, layout, className } = this.props;

    if (!isNilOrError(project)) {
      const imageUrl = (!isNilOrError(projectImages) && projectImages.length > 0 ? projectImages[0].attributes.versions.medium : null);
      const projectUrl = getProjectUrl(project);
      const isArchived = (project.attributes.publication_status === 'archived');

      const contentHeader = (
        <ContentHeader className={`${size} hasContent`}>
          <MapIcon name="simpleFolder" />
          <MapIconDescription>3 projects</MapIconDescription>
        </ContentHeader>
      );

      const screenReaderContent = (
        <ScreenReaderOnly>
          <ProjectTitle>
            <FormattedMessage {...messages.a11y_projectTitle} />
            <T value={project.attributes.title_multiloc} />
          </ProjectTitle>

          <ProjectDescription>
            <FormattedMessage {...messages.a11y_projectDescription} />
            <T value={project.attributes.description_preview_multiloc} />
          </ProjectDescription>
        </ScreenReaderOnly>
      );

      return (
        <Container
          className={`${className} ${layout} ${size} ${isArchived ? 'archived' : ''} ${!(bowser.mobile || bowser.tablet) ? 'desktop' : 'mobile'} e2e-project-card`}
          to={projectUrl}
          onClick={this.handleProjectCardOnClick(project.id)}
        >
          {screenReaderContent}
          {size !== 'large' && contentHeader}

          <ProjectImageContainer className={size}>
            <ProjectImagePlaceholder>
              <ProjectImagePlaceholderIcon name="project" />
            </ProjectImagePlaceholder>

            {imageUrl &&
              <ProjectImage
                src={imageUrl}
                alt=""
                cover={true}
              />
            }
          </ProjectImageContainer>

          <ProjectContent className={size}>
            {size === 'large' && contentHeader}

            <ContentBody className={size} aria-hidden>
              <ProjectTitle className="e2e-project-card-project-title" onClick={this.handleProjectTitleOnClick(project.id)}>
                <T value={project.attributes.title_multiloc} />
              </ProjectTitle>

              <T value={project.attributes.description_preview_multiloc}>
                {(description) => {
                  if (!isEmpty(description)) {
                    return (
                      <ProjectDescription className="e2e-project-card-project-description-preview">
                        {description}
                      </ProjectDescription>
                    );
                  }

                  return null;
                }}
              </T>
            </ContentBody>
          </ProjectContent>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render }) => <GetProject projectId={projectId}>{render}</GetProject>,
  projectImages: ({ projectId, render }) => <GetProjectImages projectId={projectId}>{render}</GetProjectImages>,
});

// TODO: remove intl if not used
const ProjectCardWithHoC = withTheme(injectIntl<Props>(ProjectCard));

// TODO: make accesible

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => {
      const props = { ...inputProps, ...dataProps };
      return <ProjectCardWithHoC {...props} />;
    }}
  </Data>
);
