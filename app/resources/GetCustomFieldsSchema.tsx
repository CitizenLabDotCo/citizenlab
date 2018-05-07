import React from 'react';
import { Subscription } from 'rxjs';
import { customFieldsSchemaForUsersStream } from 'services/userCustomFields';

interface InputProps {}

type children = (renderProps: GetCustomFieldsSchemaChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  customFieldsSchema: any;
}

export type GetCustomFieldsSchemaChildProps = any;

export default class GetCustomFieldsSchema extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      customFieldsSchema: null
    };
  }

  componentDidMount() {
    const customFieldsSchema$ = customFieldsSchemaForUsersStream().observable;

    this.subscriptions = [
      customFieldsSchema$.subscribe((customFieldsSchema) => {
        this.setState({
          customFieldsSchema: (customFieldsSchema || null)
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { customFieldsSchema } = this.state;
    return (children as children)(customFieldsSchema);
  }
}
