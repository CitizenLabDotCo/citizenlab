import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';
import 'moment-timezone';

// router
import { browserHistory } from 'react-router';

// components
import ProjectTimelinePage from '../process';
import ProjectInfoPage from '../info';

// services
import { projectBySlugStream, IProject } from 'services/projects';

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  project: IProject | null;
};

export default class timeline extends React.PureComponent<Props, State> {
  slug$: Rx.BehaviorSubject<string>;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      project: null
    };
    this.slug$ = new Rx.BehaviorSubject(null as any);
    this.subscriptions = [];
  }

  componentDidMount() {
    this.slug$.next(this.props.params.slug);

    this.subscriptions = [
      this.slug$
        .distinctUntilChanged()
        .filter(slug => isString(slug))
        .switchMap((slug) => {
          const project$ = projectBySlugStream(slug).observable;
          return project$;
        }).subscribe((project) => {
          const currentPathname = browserHistory.getCurrentLocation().pathname.replace(/\/$/, '');
          let lastUrlSegment;

          // Determine where to send the user based on process type & participation method
          if (project.data.attributes.process_type === 'timeline') {
            lastUrlSegment = 'process';
          } else if (project.data.attributes.participation_method === 'survey') {
            lastUrlSegment = 'survey';
          } else if (project.data.attributes.participation_method === 'ideation') {
            lastUrlSegment = 'ideas';
          } else {
            lastUrlSegment = 'info';
          }

          const redirectUrl = `${currentPathname}/${lastUrlSegment}`;
          browserHistory.push(redirectUrl);
          this.setState({ project });
        })
    ];
  }

  componentDidUpdate() {
    this.slug$.next(this.props.params.slug);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { project } = this.state;

    if (project) {
      return (
        <>
          {project.data.attributes.process_type === 'timeline' ? (
            <ProjectTimelinePage {...this.props} />
          ) : (
            <ProjectInfoPage {...this.props} />
          )}
        </>
      );
    }

    return null;
  }
}
