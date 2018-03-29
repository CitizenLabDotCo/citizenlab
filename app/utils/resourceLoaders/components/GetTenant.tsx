// Libraries
import React from 'react';
import { Subscription } from 'rxjs';
import { Locale } from 'typings';
import { currentTenantStream, ITenantData } from 'services/tenant';

// Typings
export interface Props {
  children: {(state: Partial<State>): any};
}
export interface State {
  tenant: ITenantData | null;
  tenantLocales: Locale[] | null;
}

class GetTenant extends React.PureComponent<Props, State> {
  private sub: Subscription;

  constructor(props) {
    super(props);
    this.state = {
      tenant: null,
      tenantLocales: null,
    };
  }

  componentDidMount() {
    this.sub = currentTenantStream().observable.subscribe((response) => {
      this.setState({ tenant: response.data, tenantLocales: response.data.attributes.settings.core.locales });
    });
  }

  componentWillUnmount() {
    this.sub.unsubscribe();
  }

  render() {
    return this.props.children(this.state);
  }
}

export default GetTenant;
