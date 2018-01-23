import * as React from 'react';
import styled from 'styled-components';

import { IProjectData } from 'services/projects';
import { projectImagesStream, IProjectImageData } from 'services/projectImages';
import { injectNestedResources, InjectedNestedResourceLoaderProps } from 'utils/resourceLoaders/nestedResourcesLoader';
import { hasPermission } from 'services/permissions';
import { media } from 'utils/styleUtils';

import { FormattedMessage } from 'utils/cl-intl';
import { FormattedDate } from 'react-intl';
import Icon from 'components/UI/Icon';
import T from 'components/T';
import Radio from 'components/UI/Radio';

import messages from './messages';

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

const Card = styled<any,'div'>('div')`
  height: 112px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-radius: 6px;
  margin-bottom: 20px;
  background: #fff;
  border: solid 1px #e6e6e6;

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


  ${props => props.selected && `
  border-color: #4BB27C;
  `}

  ${props => props.enabled ? `
    cursor: pointer;
    &:hover::after {
      opacity: 1;
    }
  ` : `
    opacity: 0.5;
    background-color: #f8f8f8;
  `}
`;

const ImageWrapper = styled.div`
  img {
    border-radius: 6px 0 0 6px;
    width: 110px;
    height: 110px;
    object-fit: cover;
  }

  ${media.smallerThanMinTablet`
    display: none;
  `}
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
  overflow: hidden;
`;

const PostingDisabledReason = styled.div`
  color: black;
  font-size: 14px;
  line-height: 20px;
  font-weight: 300;
  overflow: hidden;
`;

const PostingEnabledReason = styled.div`
  color: #84939E;
  font-size: 14px;
  line-height: 20px;
  font-weight: 300;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledAdminIcon = styled(Icon)`
  width: 1.5rem;
  margin: 1rem;
`;

type Props = {
  project: IProjectData;
  onClick: () => void;
  selected: boolean;
};

type State = {
  hasPostingRights?: boolean;
};

class ProjectCard extends React.Component<Props & InjectedNestedResourceLoaderProps<IProjectImageData>, State> {

  componentWillMount() {
    hasPermission({
      item: 'ideas',
      action: 'create',
      context: { project: this.props.project },
    }).subscribe((granted) => {
      this.setState({ hasPostingRights: granted });
    });
  }

  disabledMessage = () => {
    const project = this.props.project;
    const { enabled, future_enabled: futureEnabled } = project.relationships.action_descriptor.data.posting;
    if (enabled) {
      return null;
    } else if (futureEnabled) {
      return messages.postingPossibleFuture;
    } else {
      return messages.postingNotPossible;
    }
  }

  calculateCardState = () => {
    const { hasPostingRights } = this.state;
    const disabledMessage = this.disabledMessage();
    if (disabledMessage && hasPostingRights) {
      return 'enabledBecauseAdmin';
    } else if (disabledMessage) {
      return 'disabled';
    } else {
      return 'enabled';
    }
  }

  handleOnClick = () => {
    if (this.calculateCardState() !== 'disabled') {
      this.props.onClick();
    }
  }

  render() {
    const projectId = this.props.project.id;
    const {
      title_multiloc: titleMultiloc,
      description_preview_multiloc: descriptionPreviewMultiloc
    } = this.props.project.attributes;
    const smallImage = this.props.images.all[0] && this.props.images.all[0].attributes.versions.small;
    const disabledMessage = this.disabledMessage();
    const cardState = this.calculateCardState();
    const enabled = cardState === 'enabled' || cardState === 'enabledBecauseAdmin';
    const futureEnabledDate = this.props.project.relationships.action_descriptor.data.posting.future_enabled;


    return (
      <Container>
        <Radio
          onChange={this.handleOnClick}
          currentValue={this.props.selected ? projectId : null}
          value={projectId}
          name="project"
          id={projectId}
          label=""
          disabled={!enabled}
        />
        <Card
          onClick={this.handleOnClick}
          selected={this.props.selected}
          enabled={enabled}
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
            {cardState === 'enabled' &&
              <ProjectDescription>
                <T value={descriptionPreviewMultiloc} />
              </ProjectDescription>
            }
            {cardState === 'disabled' && disabledMessage &&
              <PostingDisabledReason>
                <FormattedMessage
                  {...disabledMessage}
                  values={{
                    date: futureEnabledDate && <FormattedDate value={futureEnabledDate} />
                  }}
                />
              </PostingDisabledReason>
            }
            {cardState === 'enabledBecauseAdmin' &&
              <PostingEnabledReason>
                <FormattedMessage {...messages.postingPossibleBecauseAdmin} />
                <StyledAdminIcon name="admin" />
              </PostingEnabledReason>
            }
          </ProjectContent>
        </Card>
      </Container>
    );
  }
}

export default injectNestedResources(
  'images',
  projectImagesStream,
  (props) => props.project.id
)(ProjectCard);
