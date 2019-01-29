import React from 'react';
import { Subscription } from 'rxjs';
import { customFieldsForUsersStream, ICustomFieldData } from 'services/userCustomFields';

interface InputProps { }

type children = (renderProps: GetCustomFieldsChildProps) => JSX.Element | null;

type IInputType = 'select' | 'multiselect' | 'checkbox';

interface Props extends InputProps {
  children?: children;
  inputTypes?: IInputType[];
  noCache?: boolean;
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
    const { inputTypes, noCache } = this.props;
    const customFields$ = customFieldsForUsersStream({ queryParameters: { input_types: inputTypes }, cacheStream: !noCache }).observable;

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
