// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import Input from 'components/UI/Input';
import { IStream } from 'utils/streams';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectSetting } from 'utils/tenant/selectors';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';

// Services
import { observeProject, IProject, IProjectData } from 'services/projects';
import { observePhase, IPhase, IPhaseData } from 'services/phases';
import { injectIntl } from 'react-intl';
import { injectTFunc } from 'utils/containers/t/utils';


// Component typing
type Props = {
  params: {
    id: string | null,
    slug: string | null,
  },
  locale: string,
  tFunc: Function,
};

type State = {
  project: IProjectData | null;
  phase: IPhaseData | null;
  attributeDiff: Partial<IPhaseData>; 
};

class AdminProjectTimelineEdit extends React.Component<Props, State> {
  project$: IStream<IProject>;
  phase$: IStream<IPhase>;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      project: null,
      phase: null,
      attributeDiff: {},
    };
    console.log(props.params.slug);
    this.project$ = observeProject(props.params.slug);
    this.phase$ = observePhase(props.params.id);
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      Rx.Observable.combineLatest(
        this.project$.observable,
        this.phase$.observable,
        (project, phase) => ({ project, phase })
      ).subscribe(({ project, phase }) => {
        this.setState({ project: project.data, phase: phase.data });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  createMultilocUpdater = (name: string) => (value: string) => {
    if (this.state.phase) {
      const newValue = this.state.phase && this.state.phase.attributes[name];
      newValue[this.props.locale] = value;
      this.setState({
        attributeDiff: { ...this.state.attributeDiff, [name]: newValue },
      });
    }
  }

  render() {
    if (!this.state.phase) return null;
    const phaseAttrs = { ...this.state.phase.attributes, ...this.state.attributeDiff };

    return (
      <div>
        <div>Edit phase</div>

        <Input 
          type="text"
          value={this.props.tFunc(phaseAttrs.title_multiloc)}
          onChange={this.createMultilocUpdater('title_multiloc')}
        />
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
});

export default injectTFunc(injectIntl(connect(mapStateToProps)(AdminProjectTimelineEdit)));
