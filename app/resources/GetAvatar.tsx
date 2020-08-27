import React from 'react';
import { isString } from 'lodash-es';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { avatarByIdStream, IAvatarData } from 'services/avatars';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  id: string | null | undefined;
  resetOnChange?: boolean;
}

type children = (renderProps: GetAvatarChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  avatar: IAvatarData | undefined | null | Error;
}

export type GetAvatarChildProps = IAvatarData | undefined | null | Error;

export default class GetAvatar extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      avatar: undefined,
    };
  }

  componentDidMount() {
    const { id, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ avatar: undefined })),
          switchMap(({ id }) => {
            if (isString(id)) {
              return avatarByIdStream(id).observable;
            }

            return of(null);
          })
        )
        .subscribe((avatar) =>
          this.setState({
            avatar: !isNilOrError(avatar) ? avatar.data : avatar,
          })
        ),
    ];
  }

  componentDidUpdate() {
    const { id } = this.props;
    this.inputProps$.next({ id });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { avatar } = this.state;
    return (children as children)(avatar);
  }
}
