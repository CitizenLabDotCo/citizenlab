import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import T from 'containers/T';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { state, IStateStream } from 'services/state';
import { localeStream } from 'services/locale';
import { ideaStatusesStream, IIdeaStatusData } from 'services/ideaStatuses';

const Badge = styled.div`
  color: white;
  font-size: 13px;
  border-radius: 3px;
  padding: 3px 8px;
  display: inline-block;
  text-transform: uppercase;
  text-align: center;
  font-weight: 700;
  background-color: ${(props: any) => props.color}
`;

type Props = {
  statusId: string,
  color: string,
  statusName: string,
  className?: string,
};

type State = {
  locale: string | null,
  ideaStatus: IIdeaStatusData | null;
};

export const namespace = 'StatusBadge/index';

export default class Status extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  componentWillMount() {
    const instanceNamespace = `${namespace}/${this.props.statusId}`;
    const initialState = { locale: null, ideaStatus: null };
    const locale$ = localeStream().observable;
    const ideaStatuses$ = ideaStatusesStream().observable;

    this.state$ = state.createStream<State>(namespace, namespace, initialState);

    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),

      Rx.Observable.combineLatest(locale$, ideaStatuses$).subscribe(([locale, ideaStatuses]) => {
        const ideaStatus = ideaStatuses.data.filter((item) => item.id === this.props.statusId)[0];
        this.state$.next({ locale, ideaStatus });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { statusId, statusName, className } = this.props;
    const { locale, ideaStatus } = this.state;
    const fallbackColor = '#bbbbbb';

    return (ideaStatus !== null && locale !== null) ? (
      <Badge className={className} color={ideaStatus.attributes.color || fallbackColor} >
        <T value={ideaStatus.attributes.title_multiloc} />
      </Badge>
    ) : null;
  }
}
