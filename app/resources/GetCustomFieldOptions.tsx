import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { customFieldOptionsStream, ICustomFieldOptionsData } from 'services/userCustomFields';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  customFieldId: string;
}

type children = (renderProps: GetCustomFieldOptionsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  customFieldOptions: ICustomFieldOptionsData[] | undefined | null | Error;
}

export type GetCustomFieldOptionsChildProps = ICustomFieldOptionsData[] | undefined | null | Error;

export default class GetCustomFieldOptions extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      customFieldOptions: undefined
    };
  }

  componentDidMount() {
    const { customFieldId } = this.props;

    this.inputProps$ = new BehaviorSubject({ customFieldId });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .switchMap(({ customFieldId }) => customFieldOptionsStream(customFieldId).observable)
        .subscribe((customFieldOptions) => this.setState({ customFieldOptions: !isNilOrError(customFieldOptions) ? customFieldOptions.data : customFieldOptions }))
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
