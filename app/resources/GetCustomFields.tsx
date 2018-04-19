import React from 'react';
import { Subscription } from 'rxjs';
import { customFieldsForUsersStream, ICustomFieldData } from 'services/userCustomFields';

interface InputProps {}

type children = (renderProps: GetCustomFieldsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  customFields: ICustomFieldData[] | null;
}

export type GetCustomFieldsChildProps = ICustomFieldData[] | null;

export default class GetCustomFields extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      customFields: null
    };
  }

  componentDidMount() {
    const customFields$ = customFieldsForUsersStream().observable;

    this.subscriptions = [
      customFields$.subscribe((customFields) => {
        this.setState({
          customFields: customFields.data
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { customFields } = this.state;
    return (children as children)(customFields);
  }
}
