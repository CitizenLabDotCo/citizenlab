import React from 'react';
import { Subscription } from 'rxjs';
import { customFieldsForUsersStream, ICustomFieldData } from 'services/userCustomFields';

interface InputProps {}

type children = (renderProps: GetCustomFieldsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  customFields: ICustomFieldData[] | undefined | null;
}

export type GetCustomFieldsChildProps = ICustomFieldData[] | undefined | null;

export default class GetCustomFields extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      customFields: undefined
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
