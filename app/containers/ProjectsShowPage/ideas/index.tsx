import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';
import { browserHistory } from 'react-router';

// components
import Header from '../Header';
import EventsPreview from '../EventsPreview';
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';

// services
import { projectBySlugStream } from 'services/projects';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';

const IdeasContainer = styled.div`
  padding-top: 70px;
  padding-bottom: 70px;
`;

const IdeasTitle = styled.h1`
  color: #333;
  font-size: 29px;
  line-height: 35px;
  font-weight: 600;
  margin-top: 40px;
  margin-bottom: 30px;
`;

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  projectId: string | null;
  defaultView: 'card' | 'map' | null;
};

export default class ProjectIdeasPage extends React.PureComponent<Props, State> {
  initialState: State;
  slug$: Rx.BehaviorSubject<string | null>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    const initialState = {
      projectId: null,
      defaultView: null
    };
    this.initialState = initialState;
    this.state = initialState;
    this.slug$ = new Rx.BehaviorSubject(null);
    this.subscriptions = [];
  }

  componentDidMount() {
    this.slug$.next(this.props.params.slug);

    this.subscriptions = [
      this.slug$
        .distinctUntilChanged()
        .do(() => this.setState(this.initialState))
        .filter(slug => isString(slug))
        .switchMap((slug: string) => {
          return projectBySlugStream(slug).observable.do((project) => {
            if (project.data.attributes.process_type !== 'continuous') {
              // redirect
              browserHistory.push(`/projects/${slug}`);
            }
          });
        })
        // .delay(2000)
        .subscribe((project) => {
          this.setState({
            projectId: project.data.id,
            defaultView: (project.data.attributes.presentation_mode || null)
          });
        })
    ];
  }

  componentDidUpdate(_prevProps: Props) {
    this.slug$.next(this.props.params.slug);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { projectId, defaultView } = this.state;
    const { slug } = this.props.params;

    if (projectId) {
      return (
        <>
          <Header slug={slug} />

          <IdeasContainer>
            <ContentContainer>
              <IdeasTitle>
                <FormattedMessage {...messages.navIdeas} />
              </IdeasTitle>
              <IdeaCards
                type="load-more"
                sort={'trending'}
                pageSize={12}
                projectId={projectId}
                showViewToggle={true}
                defaultView={defaultView}
              />
            </ContentContainer>
          </IdeasContainer>

          <EventsPreview projectId={projectId} />
        </>
      );
    }

    return null;
  }
}
