import React from 'react';
import { Subscription } from 'rxjs';
import { customFieldsForUsersStream, ICustomFieldData } from 'services/userCustomFields';
import { isBoolean } from 'lodash-es';

interface InputProps { }

type children = (renderProps: GetCustomFieldsChildProps) => JSX.Element | null;

type IInputType = 'select' | 'multiselect' | 'checkbox';

interface Props extends InputProps {
  children?: children;
  inputTypes?: IInputType[];
  cache?: boolean;
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
    const { inputTypes, cache } = this.props;
    const cacheStream = (isBoolean(cache) ? cache : true);
    const customFields$ = customFieldsForUsersStream({ cacheStream, queryParameters: { input_types: inputTypes } }).observable;

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
