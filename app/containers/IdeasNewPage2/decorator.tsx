import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { injectIntl, intlShape } from 'react-intl';
import { injectTFunc } from 'utils/containers/t/utils';
import { observeCurrentTenant, ITenant } from 'services/tenant';
import { observeCurrentUser } from 'services/auth';
import { IUser } from 'services/users';
import { stateStream, IStateStream } from 'services/state';
import { IStream } from 'utils/streams';

interface IComponentDecoratorConfig<Props> {
  id: string;
  props: Props;
  data?: Rx.Observable<any>[];
}

export interface IDefaultProps<Props> {
  intl: ReactIntl.InjectedIntl;
  tFunc: Function;
  locale: string;
  authUser: IUser | null;
  tenant: ITenant | null;
  update: (props: Partial<Props> | ((props: Props) => Partial<Props>)) => void;
}

export default function component<Props>(config: IComponentDecoratorConfig<Props>): any {
  return function (Component) {
    return class Test extends React.PureComponent {
      state$: IStateStream<Props>;
      currentUser$: IStream<IUser>;
      currentTenant$: IStream<ITenant>;
      subscriptions: Rx.Subscription[];

      constructor(props) {
        super(props);
        this.subscriptions = [];
        this.currentUser$ = observeCurrentUser();
        this.currentTenant$ = observeCurrentTenant();
        this.state$ = stateStream.observe<Props>(config.id, config.props);
      }

      update(state: Partial<Props> | ((arg: Props) => Partial<Props>)) {
        this.state$.next(state);
      }

      componentWillMount() {
        this.subscriptions = [
          this.state$.observable,
          this.currentUser$.observable.map(data => ({ currentUser: data })),
          this.currentTenant$.observable.map(data => ({ currentTenant: data })),
          ...(config.data || [])
        ].map(subscription => subscription.subscribe(state => this.setState(state)));
      }

      componentWillUnmount() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
      }

      render() {
        return <Component {...this.props} {...this.state} {...this.update} />;
      }
    };
  };
}
