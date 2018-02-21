import * as React from 'react';
import 'moment-timezone';
import { withRouter, WithRouterProps } from 'react-router';

// components
import ImageZoom from 'react-medium-image-zoom';

// services
import GetProject from 'utils/resourceLoaders/components/GetProject';
import { IProjectData } from 'services/projects';

// i18n
import T from 'components/T';
import { IProjectImageData } from 'services/projectImages';

// style
import styled from 'styled-components';
import { darken } from 'polished';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 70px;
  margin-bottom: 90px;

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
    padding-right: 90px;
  `}
`;

const IdeaBodyStyled = styled.div`
  color: #333;
  font-size: 18px;
  line-height: 26px;
  font-weight: 300;

  h1 {
    font-size: 29px;
    line-height: 35px;
    font-weight: 600;
  }

  h2 {
    font-size: 24px;
    line-height: 29px;
    font-weight: 600;
  }

  h3 {
    font-size: 21px;
    line-height: 26px;
    font-weight: 600;
  }

  h4 {
    font-size: 18px;
    line-height: 26px;
    font-weight: 600;
  }

  p {
    margin-bottom: 35px;
  }

  strong {
    font-weight: 500;
  }

  a {
    color: ${(props) => props.theme.colors.clBlue};
    text-decoration: underline;

    &:hover {
      color: ${(props) => darken(0.15, props.theme.colors.clBlue)};
    }
  }
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
    border: solid 1px #e0e0e0;

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

type State = {};

class ProjectInfo extends React.PureComponent<Props & WithRouterProps, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {};
  }

  render() {
    return (
      <GetProject slug={this.props.params.slug} withImages>
        {({ project, images }: {project: IProjectData, images: IProjectImageData[]}) => {
          if (project) {
            return (
              <Container>
                <Left>
                  <IdeaBodyStyled>
                    <T value={project.attributes.description_multiloc} />
                  </IdeaBodyStyled>
                </Left>

                <Right>
                  <ProjectImages>
                    {images.length > 0 && images.filter((image) => image).map((image) => (
                      <ImageZoom
                        key={image.id}
                        image={{ src: image.attributes.versions.large }}
                        zoomImage={{ src: image.attributes.versions.large }}
                      />
                    ))}
                  </ProjectImages>
                </Right>
              </Container>
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
