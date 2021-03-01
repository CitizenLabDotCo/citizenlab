import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import {
  userCustomFieldOptionsStream,
  IUserCustomFieldOptionData,
} from 'services/userCustomFieldOptions';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  customFieldId: string;
}

type children = (
  renderProps: GetUserCustomFieldOptionsChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  customFieldOptions: IUserCustomFieldOptionData[] | undefined | null | Error;
}

export type GetUserCustomFieldOptionsChildProps =
  | IUserCustomFieldOptionData[]
  | undefined
  | null
  | Error;

export default class GetCustomFieldOptions extends React.Component<
  Props,
  State
> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      customFieldOptions: undefined,
    };
  }

  componentDidMount() {
    const { customFieldId } = this.props;

    this.inputProps$ = new BehaviorSubject({ customFieldId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          switchMap(
            ({ customFieldId }) =>
              userCustomFieldOptionsStream(customFieldId).observable
          )
        )
        .subscribe((customFieldOptions) =>
          this.setState({
            customFieldOptions: !isNilOrError(customFieldOptions)
              ? customFieldOptions.data
              : customFieldOptions,
          })
        ),
    ];
  }

  componentDidUpdate() {
    const { customFieldId } = this.props;
    this.inputProps$.next({ customFieldId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { customFieldOptions } = this.state;
    return (children as children)(customFieldOptions);
  }
}
