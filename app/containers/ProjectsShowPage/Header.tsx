import React from 'react';
import { adopt } from 'react-adopt';

// router
import { Link } from 'react-router';

// components
import Icon from 'components/UI/Icon';
import ContentContainer from 'components/ContentContainer';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetEvents, { GetEventsChildProps } from 'resources/GetEvents';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 30px;
  padding-right: 30px;
  position: relative;

  ${media.smallerThanMinTablet`
    padding: 0;
  `}

  &.timeline {
    ${media.smallerThanMinTablet`
      height: 400px;
      padding: 0;
    `}
  }
`;

const HeaderContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;

  &.timeline {
    margin-top: -40px;
  }

  ${media.smallerThanMinTablet`
    flex-direction: column;
    justify-content: flex-start;
  `}
`;

const HeaderContentLeft = styled.div`
  flex: 1;
  margin-right: 30px;
  max-width: 500px;

  ${media.biggerThanMinTablet`
    display: flex;
    flex-direction: column;
    justify-content: center;
  `}
`;

const HeaderContentRight = styled.div`
  ${media.biggerThanMinTablet`
    display: flex;
    align-items: center;
    justify-content: right;
  `}

  ${media.smallerThanMinTablet`
    margin-top: 20px;
  `}
`;

const HeaderTitle = styled.div`
  color: #fff;
  font-size: 42px;
  line-height: 52px;
  font-weight: 500;
  text-align: left;
  margin: 0;
  padding: 0;

  ${media.smallerThanMinTablet`
    font-weight: 600;
    font-size: 31px;
    line-height: 36px;
  `}
`;

const HeaderButtons = styled.div`
  min-width: 220px;
`;

const HeaderButtonIconWrapper = styled.div`
  width: 22px;
  height: 17px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeaderButtonIcon = styled(Icon)`
  fill: rgba(255, 255, 255, 0.6);
  transition: fill 100ms ease-out;
`;

const HeaderButtonText = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 17px;
  font-weight: 400;
  text-decoration: none;
  white-space: nowrap;
  transition: color 100ms ease-out;
`;

const HeaderButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-radius: 5px;
  padding: 14px 22px;
  margin-top: 7px;
  margin-bottom: 7px;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.6);
  border: solid 1px rgba(255, 255, 255, 0.2);
  transition: all 100ms ease-out;

  &.active {
    background: #fff;
    border-color: #fff;

    ${HeaderButtonIcon} {
      fill: #333;
    }

    ${HeaderButtonText} {
      color: #333;
    }
  }

  &:not(.active):hover {
    text-decoration: none;
    background: #000;
    border-color: #fff;

    ${HeaderButtonIcon} {
      fill: #fff;
    }

    ${HeaderButtonText} {
      color: #fff;
    }
  }
`;

const HeaderOverlay = styled.div`
  background: #000;
  opacity: 0.5;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderImage: any = styled.div`
  background-image: url(${(props: any) => props.src});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

interface InputProps {
  projectSlug: string;
}

interface DataProps {
  project: GetProjectChildProps;
  events: GetEventsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class ProjectsShowPage extends React.PureComponent<Props, State> {
  render() {
    const { project, events } = this.props;

    if (project) {
      const className = this.props['className'];
      const projectSlug = project.attributes.slug;
      const projectHeaderImageLarge = (project.attributes.header_bg.large || null);
      const projectType = project.attributes.process_type;
      const hasEvents = (events && events.length > 0);

      return (
        <Container className={`${className} ${projectType}`}>
          <HeaderImage src={projectHeaderImageLarge} />
          <HeaderOverlay />
          <ContentContainer>
            <HeaderContent className={projectType}>
              <HeaderContentLeft>
                <HeaderTitle>
                  <T value={project.attributes.title_multiloc} />
                </HeaderTitle>
              </HeaderContentLeft>

              <HeaderContentRight>
                <HeaderButtons>
                  {project && project.attributes.process_type === 'timeline' &&
                    <HeaderButton
                      to={`/projects/${projectSlug}/process`}
                      activeClassName="active"
                    >
                      <HeaderButtonIconWrapper>
                        <HeaderButtonIcon name="timeline" />
                      </HeaderButtonIconWrapper>
                      <HeaderButtonText>
                        <FormattedMessage {...messages.navProcess} />
                      </HeaderButtonText>
                    </HeaderButton>
                  }

                  <HeaderButton
                    to={`/projects/${projectSlug}/info`}
                    activeClassName="active"
                  >
                    <HeaderButtonIconWrapper>
                      <HeaderButtonIcon name="info2" />
                    </HeaderButtonIconWrapper>
                    <HeaderButtonText>
                      <FormattedMessage {...messages.navInformation} />
                    </HeaderButtonText>
                  </HeaderButton>

                  {project && project.attributes.process_type === 'continuous' && project.attributes.participation_method === 'ideation' &&
                    <HeaderButton
                      to={`/projects/${projectSlug}/ideas`}
                      activeClassName="active"
                    >
                      <HeaderButtonIconWrapper>
                        <HeaderButtonIcon name="idea" />
                      </HeaderButtonIconWrapper>
                      <HeaderButtonText>
                        <FormattedMessage {...messages.navIdeas} />
                      </HeaderButtonText>
                    </HeaderButton>
                  }

                  {project && project.attributes.process_type === 'continuous' && project.attributes.participation_method === 'survey' &&
                    <HeaderButton
                      to={`/projects/${projectSlug}/survey`}
                      activeClassName="active"
                    >
                      <HeaderButtonIconWrapper>
                        <HeaderButtonIcon name="survey" />
                      </HeaderButtonIconWrapper>
                      <HeaderButtonText>
                        <FormattedMessage {...messages.navSurvey} />
                      </HeaderButtonText>
                    </HeaderButton>
                  }

                  {hasEvents &&
                    <HeaderButton
                      to={`/projects/${projectSlug}/events`}
                      activeClassName="active"
                    >
                      <HeaderButtonIconWrapper>
                        <HeaderButtonIcon name="calendar" />
                      </HeaderButtonIconWrapper>
                      <HeaderButtonText>
                        <FormattedMessage {...messages.navEvents} />
                      </HeaderButtonText>
                    </HeaderButton>
                  }
                </HeaderButtons>
              </HeaderContentRight>
            </HeaderContent>
          </ContentContainer>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  project: ({ projectSlug, render }) => <GetProject slug={projectSlug}>{render}</GetProject>,
  events: ({ project, render }) => <GetEvents projectId={(project ? project.id : null)}>{render}</GetEvents>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectsShowPage {...inputProps} {...dataProps} />}
  </Data>
);
