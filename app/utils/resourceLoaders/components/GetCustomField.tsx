import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { customFieldForUsersStream, ICustomFieldData } from 'services/userCustomFields';

interface InputProps {
  id: string;
}

type children = (renderProps: GetCustomFieldChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  customField: ICustomFieldData | null;
}

export type GetCustomFieldChildProps = ICustomFieldData | null;

export default class GetCustomField extends React.PureComponent<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      customField: null
    };
  }

  componentDidMount() {
    const { id } = this.props;

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .switchMap(({ id }) => customFieldForUsersStream(id).observable)
        .subscribe((customField) => this.setState({ customField: customField.data }))
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
