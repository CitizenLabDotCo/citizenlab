import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';

// components
import ContentContainer from 'components/ContentContainer';

// services
import { phaseStream, IPhase } from 'services/phases';

// i18n
import T from 'components/T';

type Props = {
  phaseId: string
};

type State = {
  phase: IPhase | null;
};

export default class Phase extends React.PureComponent<Props, State> {
  phaseId$: Rx.BehaviorSubject<string>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      phase: null
    };
    this.subscriptions = [];
    this.phaseId$ = new Rx.BehaviorSubject(null as any);
  }

  componentWillMount() {
    this.phaseId$.next(this.props.phaseId);

    this.subscriptions = [
      this.phaseId$.distinctUntilChanged().filter(phaseId => isString(phaseId)).switchMap((phaseId) => {
        const phase$ = phaseStream(phaseId).observable;
        return phase$;
      }).subscribe((phase) => {
        this.setState({ phase });
      })
    ];
  }

  componentWillReceiveProps(newProps: Props) {
    this.phaseId$.next(newProps.phaseId);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const className = this.props['className'];
    const { phase } = this.state;

    if (phase) {
      return (
        <ContentContainer className={className}>
          <T value={phase.data.attributes.title_multiloc} />
        </ContentContainer>
      );
    }

    return null;
  }
}
