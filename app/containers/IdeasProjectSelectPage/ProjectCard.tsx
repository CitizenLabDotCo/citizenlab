import React from 'react';
import * as moment from 'moment';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { get, isError } from 'lodash';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetProjectImages, { GetProjectImagesChildProps } from 'resources/GetProjectImages';
import GetPermission, { GetPermissionChildProps } from 'resources/GetPermission';

// components
import { FormattedMessage } from 'utils/cl-intl';
import Icon from 'components/UI/Icon';
import Radio from 'components/UI/Radio';

// i18n
import T from 'components/T';
import messages from './messages';

// styling
import styled from 'styled-components';
import { media, color } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  position: relative;
  border-radius: 5px;
  background: #fff;
  border: solid 1px #e4e4e4;
  transition: transform 250ms ease-out;

  &.enabled {
    cursor: pointer;
  }

  &:not(.enabled) {
    opacity: 0.45;
    cursor: not-allowed;
    background: transparent;
  }

  &.selected {
    border-color: ${props => props.theme.colors.success};
  }

  &.enabled:hover {
    border-color: #ccc;

    &.selected {
      border-color: ${props => props.theme.colors.success};
    }
  }
`;

const ContainerInner = styled.div`
  width: 100%;
  display: flex;
`;

const Card = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-radius: 5px;
  position: relative;

  ${media.smallerThanMinTablet`
    padding-top: 12px;
    padding-bottom: 12px;
  `}
`;

const StyledRadio = styled(Radio)`
  margin: 0;
  margin-left: 6px;
  padding: 0;
`;

const ImageWrapper = styled.div`
  margin-right: 20px;

  img {
    border-radius: 5px;
    width: 80px;
    height: 80px;
    object-fit: cover;
  }

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const ProjectImagePlaceholder = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.placeholderBg};
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
  justify-content: center;
  padding: 5px;
`;

const ProjectTitle = styled.h3`
  color: #333;
  font-size: 20px;
  line-height: 25px;
  font-weight: 400;
  margin: 0;
`;

const PostingDisabledReason = styled.div`
  color: black;
  font-size: 15px;
  line-height: 21px;
  font-weight: 300;
  margin-top: 10px;
`;

const PostingEnabledReason = styled.div`
  color: #84939E;
  font-size: 15px;
  line-height: 21px;
  font-weight: 300;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-top: 10px;
`;

const AdminIconWrapper = styled.div`
  height: 18px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface InputProps {
  projectId: string;
  onClick: () => void;
  selected: boolean;
  className?: string;
}

interface DataProps {
  project: GetProjectChildProps;
  projectImages: GetProjectImagesChildProps;
  permission: GetPermissionChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class ProjectCard extends React.PureComponent<Props, State> {
  disabledMessage = () => {
    const { project } = this.props;

    if (!isNilOrError(project)) {
      const { enabled, future_enabled: futureEnabled } = project.relationships.action_descriptor.data.posting;

      if (enabled) {
        return null;
      } else if (futureEnabled) {
        return messages.postingPossibleFuture;
      }
    }

    return messages.postingNotPossible;
  }

  calculateCardState = () => {
    const { permission } = this.props;
    const disabledMessage = this.disabledMessage();

    if (disabledMessage && permission) {
      return 'enabledBecauseAdmin';
    } else if (disabledMessage) {
      return 'disabled';
    }

    return 'enabled';
  }

  handleOnClick = () => {
    if (this.calculateCardState() !== 'disabled') {
      this.props.onClick();
    }
  }

  render() {
    const className = this.props['className'];
    const { projectId, selected } = this.props;
    const { project, projectImages, permission } = this.props;

    if (!isNilOrError(project) && !isNilOrError(permission)) {
      const { title_multiloc: titleMultiloc } = project.attributes;
      const smallImage = !isNilOrError(projectImages) && projectImages.length > 0 && projectImages[0].attributes.versions.small;
      const disabledMessage = this.disabledMessage();
      const cardState = this.calculateCardState();
      const enabled = (cardState === 'enabled' || cardState === 'enabledBecauseAdmin');
      const futureEnabledDate = project.relationships.action_descriptor.data.posting.future_enabled;
      const formattedFutureEnabledDate = (futureEnabledDate ? moment(futureEnabledDate, 'YYYY-MM-DD').format('LL') : null);

      return (
        <Container 
          onClick={this.handleOnClick} 
          className={`${className} ${selected && 'selected'} ${enabled && 'enabled'}`}
        >
          <ContainerInner>
            <Card className={`${selected && 'selected'} ${enabled && 'enabled'}`}>

              <ImageWrapper>
                {smallImage ? (
                  <img src={smallImage} alt="project image" />
                ) : (
                  <ProjectImagePlaceholder>
                    <ProjectImagePlaceholderIcon name="project" />
                  </ProjectImagePlaceholder>
                )}
              </ImageWrapper>

              <ProjectContent>
                <ProjectTitle className={`${selected && 'selected'} ${enabled && 'enabled'}`}>
                  <T value={titleMultiloc} />
                </ProjectTitle>

                {cardState === 'disabled' && disabledMessage &&
                  <PostingDisabledReason>
                    <FormattedMessage {...disabledMessage} values={{ date: formattedFutureEnabledDate }} />
                  </PostingDisabledReason>
                }

                {cardState === 'enabledBecauseAdmin' &&
                  <PostingEnabledReason>
                    <AdminIconWrapper>
                      <Icon name="admin" />
                    </AdminIconWrapper>
                    <FormattedMessage {...messages.postingPossibleBecauseAdmin} />
                  </PostingEnabledReason>
                }
              </ProjectContent>

              <StyledRadio
                onChange={this.handleOnClick}
                currentValue={selected ? projectId : null}
                value={projectId}
                name="project"
                id={projectId}
                label=""
                disabled={!enabled}
                buttonColor={color('success')}
              />
            </Card>
          </ContainerInner>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render }) => <GetProject id={projectId}>{render}</GetProject>,
  projectImages: ({ project, render }) => <GetProjectImages projectId={get(project, 'id')}>{render}</GetProjectImages>,
  permission: ({ project, render }) => <GetPermission item="ideas" action="create" context={{ project: (!isError(project) ? project : null) }}>{render}</GetPermission>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectCard {...inputProps} {...dataProps} />}
  </Data>
);
