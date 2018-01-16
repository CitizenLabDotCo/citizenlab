import React from 'react';
import { Subscription } from 'rxjs';

import { currentTenantStream, ITenantData } from 'services/tenant';

export interface InjectedTenant {
  tenant: ITenantData | null;
}

interface State {
  tenant: ITenantData | null;
}

export const injectTenant = () => {
  return <TOriginalProps extends {}>(
    Component: (React.ComponentClass<TOriginalProps & InjectedTenant> | React.StatelessComponent<TOriginalProps & InjectedTenant>)
  ) => {
    type ResultProps = TOriginalProps;

    const result = class TenantLoader extends React.Component<ResultProps, State> {
      static displayName = `TenantLoader(${Component.displayName || Component.name})`;
      sub: Subscription;

      constructor(props: ResultProps) {
        super(props);
        this.state = {
          tenant: null,
        };
      }

      componentWillMount() {
        this.sub = currentTenantStream()
        .observable
        .subscribe((response) => {
          this.setState({ tenant: response.data });
        });
      }

      componentWillUnmount() {
        this.sub.unsubscribe();
      }

      render(): JSX.Element {
        return (
          <Component {...this.state} />
        );
      }
    };

    return result;
  };
};
