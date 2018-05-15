import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { customFieldForUsersStream, ICustomFieldData } from 'services/userCustomFields';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  id: string;
}

type children = (renderProps: GetCustomFieldChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  customField: ICustomFieldData | undefined | null | Error;
}

export type GetCustomFieldChildProps = ICustomFieldData | undefined | null | Error;

export default class GetCustomField extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      customField: undefined
    };
  }

  componentDidMount() {
    const { id } = this.props;

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .switchMap(({ id }) => customFieldForUsersStream(id).observable)
        .subscribe((customField) => this.setState({ customField: !isNilOrError(customField) ? customField.data : customField }))
    ];
  }

  componentDidUpdate() {
    const { id } = this.props;
    this.inputProps$.next({ id });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { customField } = this.state;
    return (children as children)(customField);
  }
}
