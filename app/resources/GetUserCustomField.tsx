import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import {
  userCustomFieldStream,
  IUserCustomFieldData,
} from 'services/userCustomFields';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  userCustomFieldId: string;
}

type children = (
  renderProps: GetUserCustomFieldChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  customField: IUserCustomFieldData | undefined | null | Error;
}

export type GetUserCustomFieldChildProps =
  | IUserCustomFieldData
  | undefined
  | null
  | Error;

export default class GetUserCustomField extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      customField: undefined,
    };
  }

  componentDidMount() {
    const { userCustomFieldId } = this.props;

    this.inputProps$ = new BehaviorSubject({ userCustomFieldId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          switchMap(
            ({ userCustomFieldId }) =>
              userCustomFieldStream(userCustomFieldId).observable
          )
        )
        .subscribe((customField) =>
          this.setState({
            customField: !isNilOrError(customField)
              ? customField.data
              : customField,
          })
        ),
    ];
  }

  componentDidUpdate() {
    const { userCustomFieldId } = this.props;
    this.inputProps$.next({ userCustomFieldId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { customField } = this.state;
    return (children as children)(customField);
  }
}
