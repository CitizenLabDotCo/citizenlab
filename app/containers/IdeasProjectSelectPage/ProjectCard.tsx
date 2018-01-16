import * as React from 'react';
import { flow } from 'lodash';
import styled from 'styled-components';

import { IProjectData } from 'services/projects';
import { projectImagesStream, IProjectImageData } from 'services/projectImages';
import { injectNestedResources, InjectedNestedResourceLoaderProps } from 'utils/resourceLoaders/nestedResourcesLoader';

import { media, color } from 'utils/styleUtils';

import Icon from 'components/UI/Icon';
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';


const Container = styled<any,'div'>('div')`
  max-height: 112px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-radius: 6px;
  margin-bottom: 20px;
  background: #fff;
  border: solid 1px #e6e6e6;
  cursor: pointer;

  ${media.smallerThanMaxTablet`
    flex-direction: column;
    align-items: left;
    padding: 20px;
  `}

  position: relative;
  background: transparent;

  &::after {
    content: '';
    border-radius: 6px;
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
    transition: opacity 300ms cubic-bezier(0.19, 1, 0.22, 1);
    will-change: opacity;
  }

  &:hover::after {
    opacity: 1;
  }

  ${props => props.selected && `
    border-color: #4BB27C;
  `}
`;

const ImageWrapper = styled.div`
  img {
    border-radius: 6px 0 0 6px;
    width: 110px;
    height: 110px;
    object-fit: cover;
  }
`;

const ProjectImagePlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.placeholderBg};
  overflow: hidden;
  width: 110px;
  height: 110px;
`;

const ProjectImagePlaceholderIcon = styled(Icon) `
  width: 50%;
  height: 50%;
  fill: #fff;
`;

const ProjectContent = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem 0 1rem;
`;

const ProjectTitle = styled.h3`
  color: #333;
  font-size: 17px;
  font-weight: 500;
`;

const ProjectDescription = styled.div`
  color: #84939E;
  font-size: 14px;
  line-height: 20px;
  font-weight: 300;
  margin-top: 10px;
  overflow: hidden;
`;

type Props = {
  project: IProjectData;
  onClick: () => void;
  selected: boolean;
};

class ProjectCard extends React.Component<Props & InjectedNestedResourceLoaderProps<IProjectImageData>> {

  render() {
    const {
      title_multiloc: titleMultiloc,
      description_preview_multiloc: descriptionPreviewMultiloc
    } = this.props.project.attributes;
    const smallImage = this.props.images.all[0] && this.props.images.all[0].attributes.versions.small;
    return (
      <Container
        onClick={this.props.onClick}
        selected={this.props.selected}
      >
        <ImageWrapper>
          {smallImage ?
            <img src={smallImage} alt="project image" />
          :
            <ProjectImagePlaceholder>
              <ProjectImagePlaceholderIcon name="project" />
            </ProjectImagePlaceholder>
          }
        </ImageWrapper>
        <ProjectContent>
          <ProjectTitle>
            <T value={titleMultiloc} />
          </ProjectTitle>
          <ProjectDescription>
            <T value={descriptionPreviewMultiloc} />
          </ProjectDescription>
        </ProjectContent>
      </Container>
    );
  }
}

export default injectNestedResources(
  'images',
  projectImagesStream,
  (props) => props.project.id
)(ProjectCard);
