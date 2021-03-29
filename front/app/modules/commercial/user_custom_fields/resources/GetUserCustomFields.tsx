import React from 'react';
import { Subscription } from 'rxjs';
import {
  userCustomFieldsStream,
  IUserCustomFieldData,
  IUserCustomFieldInputType,
} from '../services/userCustomFields';

interface InputProps {}

type children = (
  renderProps: GetUserCustomFieldsChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
  inputTypes?: IUserCustomFieldInputType[];
}

interface State {
  userCustomFields: IUserCustomFieldData[] | undefined | null;
}

export type GetUserCustomFieldsChildProps =
  | IUserCustomFieldData[]
  | undefined
  | null;

export default class GetCustomFields extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      userCustomFields: undefined,
    };
  }

  componentDidMount() {
    const { inputTypes } = this.props;
    const userCustomFields$ = userCustomFieldsStream({
      queryParameters: { input_types: inputTypes },
    }).observable;

    this.subscriptions = [
      userCustomFields$.subscribe((userCustomFields) => {
        this.setState({
          userCustomFields: userCustomFields.data,
        });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { userCustomFields } = this.state;
    return (children as children)(userCustomFields);
  }
}
