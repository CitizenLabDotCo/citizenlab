// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';

// router
import { browserHistory } from 'react-router';

// Services
import { authUserStream } from 'services/auth';
import { areasStream, IAreas } from 'services/areas';
import { currentTenantStream, ITenant } from 'services/tenant';
import { IUser } from 'services/users';

// Components
import ProfileForm from './ProfileForm';

interface Props {}

interface State {
  authUser: IUser | null;
  areas: IAreas | null;
  currentTenant: ITenant | null;
  loaded: boolean;
}

export default class ProfileEditor extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      authUser: null,
      areas: null,
      currentTenant: null,
      loaded: false
    };
  }

  componentWillMount() {
    const currentTenant$ = currentTenantStream().observable;
    const authUser$ = authUserStream().observable;
    const areas$ = areasStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        currentTenant$,
        authUser$,
        areas$
      ).subscribe(([currentTenant, authUser, areas]) => {
        this.setState({ currentTenant, authUser, areas, loaded: true });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { currentTenant, authUser, areas, loaded } = this.state;

    if (loaded && !authUser) {
      browserHistory.push('/');
    }

    if (loaded && currentTenant && authUser && areas) {
      return (
        <ProfileForm
          user={authUser.data}
          areas={areas.data}
          tenant={currentTenant.data}
        />
      );
    }

    return null;
  }
}
