import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';

// services
import { projectByIdStream, IProject } from 'services/projects';
import { projectImagesStream, IProjectImages } from 'services/projectImages';
import { authUserStream } from 'services/auth';
import { hasPermission } from 'services/permissions';
import { isAdmin } from 'services/permissions/roles';

// components
import { FormattedMessage } from 'utils/cl-intl';
import Icon from 'components/UI/Icon';
import Radio from 'components/UI/Radio';

// i18n
import T from 'components/T';
import messages from './messages';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { transparentize } from 'polished';

const Container = styled.div`
  width: 100%;
  position: relative;
  border-radius: 6px;
  border: solid 1px #e0e0e0;
  transition: all 80ms ease-out;
  background: #fff;

  &.enabled {
    cursor: pointer;
  }

  &:not(.enabled) {
    opacity: 0.5;
    background: #f8f8f8;
    cursor: not-allowed;
  }

  &.selected {
    border-color: transparent;
    background: ${props => transparentize(0.95, props.theme.colors.success)};
  }

  &.enabled:hover {
    border-color: transparent;
  }
`;

const ContainerInner = styled.div`
  width: 100%;
  display: flex;
`;

const SelectedBox = styled.div`
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background: transparent;
  border-radius: 6px;
  border: solid 1.5px transparent;
  z-index: 2;
  transition: all 80ms ease-out;

  &.enabled:hover,
  &.selected {
    border-color: ${props => props.theme.colors.success};
  }
`;

const Card = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 6px;
  position: relative;
`;

const StyledRadio = styled(Radio)`
  margin: 0;
  margin-right: 4px;
  padding: 0;
`;

const ImageWrapper = styled.div`
  margin-right: 20px;

  img {
    border-radius: 6px;
    width: 120px;
    height: 120px;
    object-fit: cover;
  }

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const ProjectImagePlaceholder = styled.div`
  width: 110px;
  height: 110px;
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

// const ProjectDescription = styled.div`
//   color: #333;
//   font-size: 15px;
//   line-height: 21px;
//   font-weight: 300;
//   margin-top: 10px;
// `;

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

type Props = {
  projectId: string;
  onClick: () => void;
  selected: boolean;
  className?: string;
};

type State = {
  project: IProject| null;
  projectImages: IProjectImages | null;
  isAdmin: boolean;
  hasPostingRights: boolean;
  loaded: boolean;
};

export default class ProjectCard extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      project: null,
      projectImages: null,
      isAdmin: false,
      hasPostingRights: false,
      loaded: false
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { projectId } = this.props;

    const project$ = projectByIdStream(projectId).observable;
    const authUser$ = authUserStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        project$,
        authUser$
      ).switchMap(([project, authUser]) => {
        return Rx.Observable.combineLatest(
          projectImagesStream(projectId).observable,
          hasPermission({
            item: 'ideas',
            action: 'create',
            user: (authUser || undefined),
            context: { project: project.data },
          })
        ).map(([projectImages, hasPostingRights]) => ({ project, authUser, projectImages, hasPostingRights }));
      }).subscribe(({ project, authUser, projectImages, hasPostingRights }) => {
        this.setState({
          project,
          projectImages,
          hasPostingRights,
          isAdmin: (authUser ? isAdmin(authUser) : false),
          loaded: true
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  disabledMessage = () => {
    const { project } = this.state;

    if (project) {
      const { enabled, future_enabled: futureEnabled } = project.data.relationships.action_descriptor.data.posting;

      if (enabled) {
        return null;
      } else if (futureEnabled) {
        return messages.postingPossibleFuture;
      }
    }

    return messages.postingNotPossible;
  }

  calculateCardState = () => {
    const { hasPostingRights } = this.state;
    const disabledMessage = this.disabledMessage();

    if (disabledMessage && hasPostingRights) {
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
    const { project, projectImages, loaded } = this.state;

    if (loaded && project) {
      const { title_multiloc: titleMultiloc /*, description_preview_multiloc: descriptionPreviewMultiloc*/ } = project.data.attributes;
      const smallImage = projectImages && projectImages.data.length > 0 && projectImages.data[0].attributes.versions.small;
      const disabledMessage = this.disabledMessage();
      const cardState = this.calculateCardState();
      const enabled = (cardState === 'enabled' || cardState === 'enabledBecauseAdmin');
      const futureEnabledDate = project.data.relationships.action_descriptor.data.posting.future_enabled;
      const formattedFutureEnabledDate = (futureEnabledDate ? moment(futureEnabledDate, 'YYYY-MM-DD').format('LL') : null);

      return (
        <Container className={`${className} ${selected && 'selected'} ${enabled && 'enabled'}`}>
          <SelectedBox
            onClick={this.handleOnClick}
            className={`${selected && 'selected'} ${enabled && 'enabled'}`}
          />

          <ContainerInner>
            <Card className={`${selected && 'selected'} ${enabled && 'enabled'}`}>
              <StyledRadio
                onChange={this.handleOnClick}
                currentValue={selected ? projectId : null}
                value={projectId}
                name="project"
                id={projectId}
                label=""
                disabled={!enabled}
              />

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
                <ProjectTitle className={`${selected && 'selected'} ${enabled && 'enabled'}`}>
                  <T value={titleMultiloc} />
                </ProjectTitle>
                {/*
                {cardState === 'enabled' &&
                  <ProjectDescription className={`${selected && 'selected'} ${enabled && 'enabled'}`}>
                    <T value={descriptionPreviewMultiloc} />
                  </ProjectDescription>
                }
                */}
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
            </Card>
          </ContainerInner>
        </Container>
      );
    }

    return null;
  }
}
