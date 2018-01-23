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
import { media, color, fontSize } from 'utils/styleUtils';
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
  font-size: ${fontSize('base')};
  color: ${color('text')};
`;

const Right = styled.aside`
  flex: 2;
  max-width: 400px;
  ${media.phone`
    display: none;
  `}
`;

const ProjectImages = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  margin-left: -5px;
  margin-top: -5px;
  width: calc(100% + 10px);

  img {
    margin: 5px;
    border-radius: 5px;

    &:first-child {
      width: calc(100% - 10px);
    }

    &:not(:first-child) {
      width: calc(33% - 9px);
    }
  }
`;

type Props = {
  projectId: string;
  className?: string;
};

type State = {
};

class ProjectInfo extends React.PureComponent<Props & WithRouterProps, State> {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <GetProject slug={this.props.params.slug} withImages>
        {({ project, images }: {project: IProjectData, images: IProjectImageData[]}) => {
          if (project) {
            return (
              <React.Fragment>
                <ContentContainer className={this.props.className}>
                  <Container>
                    <Left>
                      <IdeaBodyStyled>
                        <T value={project.attributes.description_multiloc} />
                      </IdeaBodyStyled>
                    </Left>

                    <Right>
                      <ProjectImages>
                        {images.length > 0 && images.filter((image) => image).map((image) => (
                          <img key={image.id} src={image.attributes.versions.medium || ''} alt="" role="presentation" />
                        ))}
                      </ProjectImages>
                    </Right>
                  </Container>
                </ContentContainer>
                <EventsPreview projectId={project.id} />
              </React.Fragment>
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
