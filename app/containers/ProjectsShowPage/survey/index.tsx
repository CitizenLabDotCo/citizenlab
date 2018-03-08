import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';

// components
import Header from '../Header';
import ContentContainer from 'components/ContentContainer';
import Survey from '../process/survey';

// services
import { projectBySlugStream, IProject } from 'services/projects';

// styling
import styled from 'styled-components';

const SurveyContainer = styled.div`
  padding-top: 70px;
  padding-bottom: 70px;
`;

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  project: IProject | null;
};

export default class ProjectSurvey extends React.PureComponent<Props, State> {
  slug$: Rx.BehaviorSubject<string>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
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
        .switchMap((slug: string) => projectBySlugStream(slug).observable)
        .subscribe(project => this.setState({ project }))
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

    return (
      <React.Fragment>
        <Header slug={this.props.params.slug} />
        <ContentContainer>
          <SurveyContainer>
            {project &&
              <Survey
                surveyService={project.data.attributes.survey_service}
                surveyEmbedUrl={project.data.attributes.survey_embed_url}
              />
            }
          </SurveyContainer>
        </ContentContainer>
      </React.Fragment>
    );
  }
}
