// Libraries
import * as React from 'react';
import { Subscription, Observable } from 'rxjs';

// Services
import { authUserStream } from 'services/auth';
import { areasStream, IAreaData } from 'services/areas';
import { currentTenantStream, ITenantData } from 'services/tenant';
import { IUserData } from 'services/users';

// Components
import ProfileForm from './ProfileForm';

// Typings
interface Props {}
interface State {
  user: IUserData | null;
  areas: IAreaData[] | null;
  tenant: ITenantData | null;
}


class ProfileEditor extends React.Component<Props, State> {
  sub: Subscription | null = null;

  constructor(props) {
    super(props);

    this.state = {
      user: null,
      areas: [],
      tenant: null,
    };
  }

  componentWillMount() {
    this.sub = authUserStream().observable
    .switchMap((user) => {
      if (!user) {
        return Observable.of({ user: null, areas: null, tenant: null });
      }
      return Observable.combineLatest(
        areasStream().observable,
        currentTenantStream().observable,
        ((areas, tenant) => {
          return { areas: areas.data, tenant: tenant.data, user: user.data };
        })
      );
    })
    .subscribe(({ user, areas, tenant }) => {
      this.setState({ user, areas, tenant });
    });
  }

  componentWillUnmount() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  render() {
    if (this.state.user && this.state.areas && this.state.tenant) {
      return (
        <ProfileForm
          user={this.state.user}
          areas={this.state.areas}
          tenant={this.state.tenant}
        />
      );
    }
    return null;
  }
}

export default ProfileEditor;
