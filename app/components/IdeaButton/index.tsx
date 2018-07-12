import React, { PureComponent } from 'react';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { of } from 'rxjs/observable/of';

// services
import { IProjectData, projectByIdStream, IProject } from 'services/projects';
import { IPhase, IPhaseData, phaseStream } from 'services/phases';
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
  size?: '1' | '2' | '3' | '4';
  padding?: string;
};

type State = {
  project?: IProjectData | undefined;
  phase?: IPhaseData | undefined;
};

class IdeaButton extends PureComponent<Props & InjectedIntlProps, State> {
  projectId$: BehaviorSubject<string | undefined>;
  phaseId$: BehaviorSubject<string | undefined>;
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      project: undefined,
      phase: undefined
    };
    this.projectId$ = new BehaviorSubject(undefined);
    this.phaseId$ = new BehaviorSubject(undefined);
    this.subscriptions = [];
  }

  componentDidMount() {
    const projectId$ = this.projectId$.distinctUntilChanged();
    const phaseId$ = this.phaseId$.distinctUntilChanged();

    this.projectId$.next(this.props.projectId);
    this.phaseId$.next(this.props.phaseId);

    this.subscriptions = [
      combineLatest(
        projectId$,
        phaseId$
      ).pipe(
        switchMap(([projectId, phaseId]) => {
          const phaseObservable: Observable<IPhase | undefined> = (phaseId ? phaseStream(phaseId).observable : of(undefined));

          return phaseObservable.pipe(
            map((phase) => ({
              phase,
              projectId: (phase ? phase.data.relationships.project.data.id : projectId)
            })),
            switchMap(({ projectId, phase }) => {
              const projectObservable: Observable<IProject | undefined> = (projectId ? projectByIdStream(projectId).observable : of(undefined));

              return projectObservable.pipe(
                map(project => ({ project, phase }))
              );
            })
          );
        })
      ).subscribe(({ project, phase }) => {
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
      let { style, size } = this.props;
      const { padding } = this.props;
      const startAnIdeaText = this.props.intl.formatMessage(messages.startAnIdea);

      style = (style || 'primary');
      size = (size || '1');

      return (
        <Button
          className={this.props['className']}
          linkTo={(project ? `/projects/${project.attributes.slug}/ideas/new` : '/ideas/new')}
          style={style}
          size={size}
          padding={padding}
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
