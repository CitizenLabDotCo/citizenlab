import * as React from 'react';
import 'moment-timezone';
import { withRouter, WithRouterProps } from 'react-router';

// components
import ContentContainer from 'components/ContentContainer';
import EventsPreview from '../EventsPreview';

// services
import GetProject from 'utils/resourceLoaders/components/GetProject';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { IProjectData } from 'services/projects';
import T from 'components/T';
import { IProjectImageData } from 'services/projectImages';

const Container = styled.div`
  margin-top: 75px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  ${media.phone`
    display: block;
  `}
`;

const Left = styled.section`
  flex: 3;

  ${media.phone`
    margin-bottom: 20px;
  `}

  ${media.biggerThanPhone`
    padding-right: 30px;
  `}
`;

const IdeaBodyStyled = styled.div`
  margin-top: 45px;
  font-size: 18px;
  color: #777777;
`;

const Right = styled.aside`
  flex: 2;
  max-width: 400px;
  ${media.phone`
    display: none;
  `}
`;

const ProjectImages = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
`;

const ProjectImage = styled.img`
  margin: 5px;
  border-radius: 5px;

  &:first-child {
    width: 100%;
  }

  &:not(:first-child) {
    width: calc(33% - 9px);
  }
`;

type Props = {
  projectId: string;
};

type State = {
};

class ProjectInfo extends React.PureComponent<Props & WithRouterProps, State> {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentWillMount() {

  }

  componentWillReceiveProps() {
  }

  componentWillUnmount() {
  }

  render() {
    const className = this.props['className'];

    return (
      <GetProject slug={this.props.params.slug} withImages>
        {({ project, images }: {project: IProjectData, images: IProjectImageData[]}) => {
          if (project) {
            return (
              <ContentContainer className={className}>
                <Container>
                  <Left>
                      <IdeaBodyStyled>
                        <T value={project.attributes.description_multiloc} />
                      </IdeaBodyStyled>
                  </Left>

                  <Right>
                    <ProjectImages>
                      {images.length > 0 && images.filter((image) => image).map((image) => (
                        <ProjectImage key={image.id} src={image.attributes.versions.medium as string} />
                      ))}
                    </ProjectImages>
                  </Right>
                </Container>
                <EventsPreview projectId={project.id} />
              </ContentContainer>
            );
          } else {
            return null;
          }
        }}
      </GetProject>
    );
  }
}

export default withRouter(ProjectInfo);
