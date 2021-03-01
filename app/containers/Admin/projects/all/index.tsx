import React, { PureComponent, Suspense } from 'react';
import { Subscription } from 'rxjs';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { isString, isFunction } from 'lodash-es';
import clHistory from 'utils/cl-router/history';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';

// tracking
import { trackPage } from 'utils/analytics';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import eventEmitter from 'utils/eventEmitter';
import { isAdmin } from 'services/permissions/roles';

// components
import CreateProject from './CreateProject';
import PageWrapper from 'components/admin/PageWrapper';
import { PageTitle, SectionDescription } from 'components/admin/Section';
import HasPermission from 'components/HasPermission';
import ProjectTemplatePreviewPageAdmin from 'components/ProjectTemplatePreview/ProjectTemplatePreviewPageAdmin';
import { Spinner } from 'cl2-component-library';
import Outlet from 'components/Outlet';

const ModeratorProjectList = React.lazy(() =>
  import('./Lists/ModeratorProjectList')
);
const AdminProjectList = React.lazy(() => import('./Lists/AdminProjectList'));

// style
import styled from 'styled-components';

const Container = styled.div``;

const CreateAndEditProjectsContainer = styled.div`
  &.hidden {
    display: none;
  }
`;

const ProjectTemplatePreviewContainer = styled.div`
  &.hidden {
    display: none;
  }
`;

const CreateProjectWrapper = styled.div`
  margin-bottom: 18px;
`;

const ListsContainer = styled.div`
  min-height: 80vh;
`;

export const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 25px;

  & ~ & {
    margin-top: 70px;
  }
`;

export interface InputProps {
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  selectedProjectTemplateId: string | null;
}

const useCapture = false;

class AdminProjectsList extends PureComponent<Props, State> {
  subscriptions: Subscription[];
  unlisten: Function | null = null;
  url: string | null | undefined = null;
  goBackUrl: string | null | undefined = null;

  constructor(props) {
    super(props);
    this.state = {
      selectedProjectTemplateId: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      eventEmitter
        .observeEvent<string>('ProjectTemplateCardClicked')
        .subscribe(({ eventValue }) => {
          if (isString(eventValue)) {
            const selectedProjectTemplateId = eventValue;
            const { locale } = this.props;
            const url = `/admin/projects/templates/${selectedProjectTemplateId}`;

            if (!isNilOrError(locale) && url) {
              this.url = `${window.location.origin}/${locale}${url}`;
              this.goBackUrl = 'window.location.href';
              this.goBackUrl = `${window.location.origin}/${locale}${
                removeLocale(window.location.pathname).pathname
              }`;
              window.history.pushState({ path: this.url }, '', this.url);
              window.addEventListener(
                'popstate',
                this.handlePopstateEvent,
                useCapture
              );
              window.addEventListener(
                'keydown',
                this.handleKeypress,
                useCapture
              );
              this.unlisten = clHistory.listen(() =>
                this.closeTemplatePreview()
              );
              trackPage(url);
            }

            window.scrollTo(0, 0);
            this.setState({ selectedProjectTemplateId });
          }
        }),
    ];
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (
      prevState.selectedProjectTemplateId &&
      !this.state.selectedProjectTemplateId
    ) {
      this.cleanup();
    }
  }

  componentWillUnmount() {
    this.cleanup();
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  closeTemplatePreview = () => {
    this.setState({ selectedProjectTemplateId: null });
  };

  cleanup = () => {
    if (this.goBackUrl) {
      window.removeEventListener(
        'popstate',
        this.handlePopstateEvent,
        useCapture
      );
      window.removeEventListener('keydown', this.handleKeypress, useCapture);

      if (window.location.href === this.url) {
        window.history.pushState({ path: this.goBackUrl }, '', this.goBackUrl);
      }
    }

    this.url = null;
    this.goBackUrl = null;

    if (isFunction(this.unlisten)) {
      this.unlisten();
      this.unlisten = null;
    }
  };

  handlePopstateEvent = () => {
    this.closeTemplatePreview();
  };

  handleKeypress = (event: KeyboardEvent) => {
    if (event.type === 'keydown' && event.key === 'Escape') {
      event.preventDefault();
      this.closeTemplatePreview();
    }
  };

  render() {
    const { selectedProjectTemplateId } = this.state;
    const { authUser, className } = this.props;

    const userIsAdmin = !isNilOrError(authUser)
      ? isAdmin({ data: authUser })
      : false;

    return (
      <Container className={className}>
        <CreateAndEditProjectsContainer
          className={selectedProjectTemplateId ? 'hidden' : ''}
        >
          <PageTitle>
            <FormattedMessage {...messages.overviewPageTitle} />
          </PageTitle>

          <SectionDescription>
            <HasPermission
              item={{ type: 'route', path: '/admin/projects/new' }}
              action="access"
            >
              <FormattedMessage {...messages.overviewPageSubtitle} />
              <HasPermission.No>
                <FormattedMessage {...messages.overviewPageSubtitleModerator} />
              </HasPermission.No>
            </HasPermission>
          </SectionDescription>

          <CreateProjectWrapper>
            {userIsAdmin ? (
              <CreateProject />
            ) : (
              <Outlet id="app.containers.AdminPage.projects.all.createProjectNotAdmin" />
            )}
          </CreateProjectWrapper>

          <PageWrapper>
            <ListsContainer>
              <Suspense fallback={<Spinner />}>
                {userIsAdmin ? <AdminProjectList /> : <ModeratorProjectList />}
              </Suspense>
            </ListsContainer>
          </PageWrapper>
        </CreateAndEditProjectsContainer>

        <ProjectTemplatePreviewContainer
          className={!selectedProjectTemplateId ? 'hidden' : ''}
        >
          {selectedProjectTemplateId && (
            <ProjectTemplatePreviewPageAdmin
              projectTemplateId={selectedProjectTemplateId}
              goBack={this.closeTemplatePreview}
            />
          )}
        </ProjectTemplatePreviewContainer>
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <AdminProjectsList {...inputProps} {...dataProps} />}
  </Data>
);
