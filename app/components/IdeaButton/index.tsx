import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// services
import { IProjectData, projectByIdStream } from 'services/projects';
import { IPhaseData, phaseStream } from 'services/phases';
import { postingButtonState } from 'services/ideaPostingRules';

// components
import Button, { ButtonStyles } from 'components/UI/Button';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

type Props = {
  projectId?: string | undefined;
  phaseId?: string | undefined;
  style?: ButtonStyles;
};

type State = {
  project?: IProjectData | undefined;
  phase?: IPhaseData | undefined;
};

class IdeaButton extends React.PureComponent<Props & InjectedIntlProps, State> {
  projectId$: Rx.BehaviorSubject<string | undefined>;
  phaseId$: Rx.BehaviorSubject<string | undefined>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      project: undefined,
      phase: undefined
    };
    this.projectId$ = new Rx.BehaviorSubject(undefined);
    this.phaseId$ = new Rx.BehaviorSubject(undefined);
    this.subscriptions = [];
  }

  componentDidMount() {
    const projectId$ = this.projectId$.distinctUntilChanged();
    const phaseId$ = this.phaseId$.distinctUntilChanged();

    this.projectId$.next(this.props.projectId);
    this.phaseId$.next(this.props.phaseId);

    this.subscriptions = [
      Rx.Observable.combineLatest(
        projectId$,
        phaseId$
      ).switchMap(([projectId, phaseId]) => {
        return (phaseId ? phaseStream(phaseId).observable : Rx.Observable.of(undefined)).map((phase) => ({
          phase,
          projectId: (phase ? phase.data.relationships.project.data.id : projectId)
        }));
      }).switchMap(({ projectId, phase }) => {
        return (projectId ? projectByIdStream(projectId).observable : Rx.Observable.of(undefined)).map(project => ({ project, phase }));
      }).subscribe(({ project, phase }) => {
        this.setState({
          project: (project ? project.data : undefined),
          phase: (phase ? phase.data : undefined)
        });
      })
    ];
  }

  componentDidUpdate() {
    this.projectId$.next(this.props.projectId);
    this.phaseId$.next(this.props.phaseId);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { project, phase } = this.state;
    const { show, enabled } = postingButtonState({ project, phase });

    if (show) {
      let { style } = this.props;
      const startAnIdeaText = this.props.intl.formatMessage(messages.startAnIdea);
  
      style = (style || 'primary');

      return (
        <Button
          className={this.props['className']}
          linkTo={(project ? `/projects/${project.attributes.slug}/ideas/new` : '/ideas/new')}
          style={style}
          size="1"
          text={startAnIdeaText}
          circularCorners={false}
          disabled={!enabled}
        />
      );
    }

    return null;
  }
}

export default injectIntl<Props>(IdeaButton);
