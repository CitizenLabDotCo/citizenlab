import React from 'react';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import {
  IInitiativeData,
  initiativeByIdStream,
  initiativeBySlugStream,
} from 'services/initiatives';

interface InputProps {
  id?: string | null;
  slug?: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetInitiativeChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  initiative: IInitiativeData | undefined | null | Error;
}

export type GetInitiativeChildProps =
  | IInitiativeData
  | undefined
  | null
  | Error;

export default class GetInitiative extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      initiative: undefined,
    };
  }

  componentDidMount() {
    const { id, slug, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ id, slug });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ initiative: undefined })),
          switchMap(({ id, slug }) => {
            if (isString(id)) {
              return initiativeByIdStream(id).observable;
            } else if (isString(slug)) {
              return initiativeBySlugStream(slug).observable;
            }

            return of(null);
          })
        )
        .subscribe((initiative) => {
          this.setState({
            initiative: !isNilOrError(initiative)
              ? initiative.data
              : initiative,
          });
        }),
    ];
  }

  componentDidUpdate() {
    const { id, slug } = this.props;
    this.inputProps$.next({ id, slug });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { initiative } = this.state;
    return (children as children)(initiative);
  }
}
