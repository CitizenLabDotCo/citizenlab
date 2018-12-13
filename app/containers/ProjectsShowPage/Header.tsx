import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectNavbar from './ProjectNavbar';

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
  width: 100%;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 20px;
  padding-right: 20px;
  position: relative;
  background: #767676;

  ${media.smallerThanMinTablet`
    height: 200px;
  `}
`;

const HeaderContent = styled(ContentContainer)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: -40px;

  ${media.smallerThanMinTablet`
    margin-top: 0px;
  `}
`;

const ArchivedLabelWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const ArchivedLabel = styled.span`
  color: #fff;
  font-size: ${fontSizes.small}px;
  font-weight: 500;
  text-transform: uppercase;
  border-radius: 5px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, .45);
  margin-top: 15px;
`;

const HeaderTitle = styled.h2`
  color: #fff;
  font-size: 42px;
  line-height: 52px;
  font-weight: 500;
  text-align: center;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  padding: 0;

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
  phaseId?: string | null;
}

interface DataProps {
  project: GetProjectChildProps;
  events: GetEventsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class ProjectsShowPage extends PureComponent<Props, State> {
  render() {
    const { projectSlug, phaseId, project } = this.props;

    if (!isNilOrError(project)) {
      const projectHeaderImageLarge = (project.attributes.header_bg.large || null);
      const projectType = project.attributes.process_type;
      const projectPublicationStatus = project.attributes.publication_status;

      return (
        <>
          <ProjectNavbar projectSlug={projectSlug} phaseId={phaseId} />
          <Container className={projectType}>
            <HeaderImage src={projectHeaderImageLarge} />
            <HeaderOverlay />
            <HeaderContent className={projectType}>
              <HeaderTitle>
                <T value={project.attributes.title_multiloc} />
              </HeaderTitle>
              {projectPublicationStatus === 'archived' &&
                <ArchivedLabelWrapper>
                  <ArchivedLabel>
                    <FormattedMessage {...messages.archived} />
                  </ArchivedLabel>
                </ArchivedLabelWrapper>
              }
            </HeaderContent>
          </Container>
        </>
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
