import React from 'react';
import { Subscription } from 'rxjs';
import { ILockedField, lockedFieldsStream } from 'services/auth';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

type children = (renderProps: GetLockedFieldsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  lockedFields: ILockedField[] | undefined | null | Error;
}

export type GetLockedFieldsChildProps =
  | ILockedField[]
  | undefined
  | null
  | Error;

export default class GetLockedFields extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      lockedFields: undefined,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      lockedFieldsStream().observable.subscribe((lockedFields) =>
        this.setState({
          lockedFields: !isNilOrError(lockedFields)
            ? lockedFields.data
            : lockedFields,
        })
      ),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { lockedFields } = this.state;
    return (children as children)(lockedFields);
  }
}
