import React from 'react';
import { isEqual } from 'lodash-es';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, switchMap, map, filter } from 'rxjs/operators';
import { IAvatarData, avatarByIdStream } from 'services/avatars';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  ids?: string[];
}

type children = (renderProps: GetAvatarsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  avatars: (IAvatarData | Error)[] | undefined | null | Error;
}

export type GetAvatarsChildProps =
  | (IAvatarData | Error)[]
  | undefined
  | null
  | Error;

export default class GetAvatars extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      avatars: undefined,
    };
  }

  componentDidMount() {
    const { ids } = this.props;

    this.inputProps$ = new BehaviorSubject({ ids });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => isEqual(prev, next)),
          filter(({ ids }) => !!(ids && ids.length > 0)),
          switchMap(({ ids }: { ids: string[] }) => {
            return combineLatest(
              ids.map((id) =>
                avatarByIdStream(id).observable.pipe(
                  map((avatar) =>
                    !isNilOrError(avatar) ? avatar.data : avatar
                  )
                )
              )
            );
          })
        )
        .subscribe((avatars) => {
          this.setState({ avatars });
        }),
    ];
  }

  componentDidUpdate() {
    this.inputProps$.next({ ids: this.props.ids });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { avatars } = this.state;
    return (children as children)(avatars);
  }
}
