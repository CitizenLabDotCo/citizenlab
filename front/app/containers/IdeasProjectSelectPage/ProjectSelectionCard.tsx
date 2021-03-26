import React, { PureComponent } from 'react';
import moment from 'moment';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { get, isError } from 'lodash-es';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetProjectImages, {
  GetProjectImagesChildProps,
} from 'resources/GetProjectImages';
import GetPermission, {
  GetPermissionChildProps,
} from 'resources/GetPermission';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// components
import { FormattedMessage } from 'utils/cl-intl';
import { Icon, Radio } from 'cl2-component-library';

// i18n
import T from 'components/T';
import messages from './messages';

// styling
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  position: relative;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: #fff;
  border: solid 1px ${colors.separation};
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
    border-color: ${colors.clGreen};
  }

  &.enabled:hover {
    border-color: #ccc;

    &.selected {
      border-color: ${colors.clGreen};
    }
  }

  ${media.smallerThanMinTablet`
    padding-top: 12px;
    padding-bottom: 12px;
  `}
`;

const ImageWrapper = styled.div`
  flex: 0 0 auto;
  width: 80px;
  height: 80px;
  margin-right: 20px;

  img {
    width: 100%;
    height: 100%;
    border-radius: ${(props: any) => props.theme.borderRadius};
    object-fit: cover;
  }

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const ProjectImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  border-radius: ${(props: any) => props.theme.borderRadius};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.colors.placeholderBg};
`;

const ProjectImagePlaceholderIcon = styled(Icon)`
  width: 50%;
  height: 50%;
  fill: #fff;
`;

const ProjectContent = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 5px;
`;

const ProjectTitle = styled.h3`
  color: #333;
  font-size: ${fontSizes.xl}px;
  line-height: 25px;
  font-weight: 400;
  margin: 0;
`;

const PostingDisabledReason = styled.div`
  color: black;
  font-size: ${fontSizes.base}px;
  line-height: 21px;
  font-weight: 300;
  margin-top: 10px;
`;

const PostingEnabledReason = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
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

const StyledRadio = styled(Radio)`
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  margin: 0;
  margin-left: 6px;
  padding: 0;
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
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class ProjectSelectionCard extends PureComponent<Props, State> {
  disabledMessage = () => {
    const { project, authUser } = this.props;

    if (!isNilOrError(project)) {
      const {
        enabled,
        future_enabled: futureEnabled,
        disabled_reason: disabledReason,
      } = project.attributes.action_descriptor.posting_idea;
      if (enabled) {
        return null;
      } else if (disabledReason === 'not_permitted') {
        if (isNilOrError(authUser)) {
          return messages.postingDisabledMaybeNoPermissions;
        } else {
          return messages.postingDisabledNoPermissions;
        }
      } else if (futureEnabled) {
        return messages.postingPossibleFuture;
      } else {
        return messages.postingNotPossible;
      }
    } else {
      return null;
    }
  };

  calculateCardState = () => {
    const { permission } = this.props;
    const disabledMessage = this.disabledMessage();

    if (disabledMessage && permission) {
      return 'enabledBecauseAdmin';
    } else if (disabledMessage) {
      return 'disabled';
    } else {
      return 'enabled';
    }
  };

  handleOnClick = () => {
    if (this.calculateCardState() !== 'disabled') {
      this.props.onClick();
    }
  };

  render() {
    const { projectId, selected, className } = this.props;
    const { project, projectImages, permission } = this.props;

    if (
      !isNilOrError(project) &&
      !isNilOrError(permission) &&
      !isNilOrError(projectImages)
    ) {
      const { title_multiloc: titleMultiloc } = project.attributes;
      const smallImage =
        projectImages.length > 0
          ? projectImages[0].attributes.versions.small
          : null;
      const disabledMessage = this.disabledMessage();
      const cardState = this.calculateCardState();
      const enabled =
        cardState === 'enabled' || cardState === 'enabledBecauseAdmin';
      const futureEnabledDate =
        project.attributes.action_descriptor.posting_idea.future_enabled;
      const formattedFutureEnabledDate = futureEnabledDate
        ? moment(futureEnabledDate, 'YYYY-MM-DD').format('LL')
        : null;

      return (
        <Container
          onClick={this.handleOnClick}
          className={`${className} ${selected ? 'selected' : ''} ${
            enabled ? 'enabled' : 'disabled'
          }`}
        >
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
            <ProjectTitle
              className={`${selected && 'selected'} ${enabled && 'enabled'}`}
            >
              <T value={titleMultiloc} />
            </ProjectTitle>

            {cardState === 'disabled' && disabledMessage && (
              <PostingDisabledReason>
                <FormattedMessage
                  {...disabledMessage}
                  values={{ date: formattedFutureEnabledDate }}
                />
              </PostingDisabledReason>
            )}

            {cardState === 'enabledBecauseAdmin' && (
              <PostingEnabledReason>
                <AdminIconWrapper>
                  <Icon name="admin" ariaHidden />
                </AdminIconWrapper>
                <FormattedMessage {...messages.postingPossibleBecauseAdmin} />
              </PostingEnabledReason>
            )}
          </ProjectContent>

          <StyledRadio
            onChange={this.handleOnClick}
            currentValue={selected ? projectId : null}
            value={projectId}
            name="project"
            id={projectId}
            label=""
            disabled={!enabled}
            buttonColor={colors.clGreen}
          />
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  projectImages: ({ project, render }) => (
    <GetProjectImages projectId={get(project, 'id')}>{render}</GetProjectImages>
  ),
  permission: ({ project, render }) => (
    <GetPermission
      item="idea"
      action="create"
      context={{ project: !isError(project) ? project : null }}
    >
      {render}
    </GetPermission>
  ),
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ProjectSelectionCard {...inputProps} {...dataProps} />}
  </Data>
);
