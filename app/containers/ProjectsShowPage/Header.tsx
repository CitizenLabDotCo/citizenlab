import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
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
import { media, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  background-color: #767676;
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
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin-right: 30px;
  max-width: 500px;
`;

const ArchivedLabel = styled.span`
  flex-grow: 0;
  flex-shrink: 1;
  display: flex;
  color: #fff;
  font-size: ${fontSizes.small}px;
  font-weight: 500;
  text-transform: uppercase;
  border-radius: 5px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, .45);
  /* margin-top: -30px; */
  margin-bottom: 5px;
`;

const HeaderTitle = styled.div`
  color: #fff;
  font-size: 42px;
  line-height: 52px;
  font-weight: 500;
  text-align: left;
  margin: 0;
  padding: 0;
  width: 100%;

  ${media.smallerThanMinTablet`
    font-weight: 600;
    font-size: ${fontSizes.xxxl}px;
    line-height: 36px;
  `}
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
    const { project } = this.props;

    if (!isNilOrError(project)) {
      const className = this.props['className'];
      const projectHeaderImageLarge = (project.attributes.header_bg.large || null);
      const projectType = project.attributes.process_type;
      const projectPublicationStatus = project.attributes.publication_status;

      return (
        <Container className={`${className ? className : ''} ${projectType}`}>
          <HeaderImage src={projectHeaderImageLarge} />
          <HeaderOverlay />
          <ContentContainer>
            <HeaderContent className={projectType}>
              <HeaderContentLeft>
                {projectPublicationStatus === 'archived' &&
                  <ArchivedLabel>
                    <FormattedMessage {...messages.archived} />
                  </ArchivedLabel>
                }
                <HeaderTitle>
                  <T value={project.attributes.title_multiloc} />
                </HeaderTitle>
              </HeaderContentLeft>
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
  events: ({ project, render }) => <GetEvents projectId={(!isNilOrError(project) ? project.id : null)}>{render}</GetEvents>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectsShowPage {...inputProps} {...dataProps} />}
  </Data>
);
