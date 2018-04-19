import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { customFieldOptionsStream, ICustomFieldOptionsData } from 'services/userCustomFields';

interface InputProps {
  customFieldId: string;
}

type children = (renderProps: GetCustomFieldOptionsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  customFieldOptions: ICustomFieldOptionsData[] | null;
}

export type GetCustomFieldOptionsChildProps = ICustomFieldOptionsData[] | null;

export default class GetCustomFieldOptions extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      customFieldOptions: null
    };
  }

  componentDidMount() {
    const { customFieldId } = this.props;

    this.inputProps$ = new BehaviorSubject({ customFieldId });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .switchMap(({ customFieldId }) => customFieldOptionsStream(customFieldId).observable)
        .subscribe((customFieldOptions) => this.setState({ customFieldOptions: customFieldOptions.data }))
    ];
  }

  componentDidUpdate() {
    const { customFieldId } = this.props;
    this.inputProps$.next({ customFieldId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { customFieldOptions } = this.state;
    return (children as children)(customFieldOptions);
  }
}
