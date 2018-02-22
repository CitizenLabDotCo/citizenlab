import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';
import { browserHistory } from 'react-router';

// components
import Header from '../Header';
import Ideas from './Ideas';
import EventsPreview from '../EventsPreview';
import ContentContainer from 'components/ContentContainer';

// services
import { projectBySlugStream, IProject } from 'services/projects';

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
  project: IProject | null;
};

export default class ProjectIdeasPage extends React.PureComponent<Props, State> {
  slug$: Rx.BehaviorSubject<string | null>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      project: null
    };
    this.slug$ = new Rx.BehaviorSubject(null);
    this.subscriptions = [];
  }

  componentDidMount() {
    this.slug$.next(this.props.params.slug);

    this.subscriptions = [
      this.slug$
        .distinctUntilChanged()
        .filter(slug => isString(slug))
        .switchMap((slug: string) => {
          return projectBySlugStream(slug).observable.do((project) => {
            if (project.data.attributes.process_type !== 'continuous') {
              // redirect
              browserHistory.push(`/projects/${slug}`);
            }
          });
        }).subscribe((project) => {
          this.setState({ project });
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
    const { project } = this.state;
    const { slug } = this.props.params;

    if (project) {
      return (
        <>
          <Header slug={slug} />

          <IdeasContainer>
            <ContentContainer>
              <IdeasTitle>
                <FormattedMessage {...messages.navIdeas} />
              </IdeasTitle>
              <Ideas type="project" id={project.data.id} defaultDisplay={project.data.attributes.presentation_mode}/>
            </ContentContainer>
          </IdeasContainer>

          <EventsPreview projectId={project.data.id} />
        </>
      );
    }

    return null;
  }
}
