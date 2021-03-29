import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import {
  IMachineTranslationData,
  machineTranslationByIdeaIdStream,
  machineTranslationByCommentIdStream,
  machineTranslationByInitiativeIdStream,
} from 'modules/commercial/machine_translations/services/machineTranslations';
import { isNilOrError } from 'utils/helperUtils';
import { Locale } from 'typings';

interface InputProps {
  attributeName: 'body_multiloc' | 'title_multiloc';
  localeTo: Locale;
  id: string;
  context: 'idea' | 'initiative' | 'comment';
  resetOnChange?: boolean;
}

export type GetMachineTranslationChildProps =
  | IMachineTranslationData
  | undefined
  | null
  | Error;

type children = (
  renderProps: GetMachineTranslationChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  machineTranslation: GetMachineTranslationChildProps;
}

export default class GetMachineTranslation extends React.Component<
  Props,
  State
> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      machineTranslation: undefined,
    };
  }

  componentDidMount() {
    const { attributeName, localeTo, id, context, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({
      attributeName,
      localeTo,
      id,
      context,
      resetOnChange,
    });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(
            () =>
              resetOnChange && this.setState({ machineTranslation: undefined })
          ),
          switchMap(({ id }) => {
            const queryParameters = {
              machine_translation: {
                locale_to: localeTo,
                attribute_name: attributeName,
              },
            };

            if (isString(id)) {
              switch (context) {
                case 'idea':
                  return machineTranslationByIdeaIdStream(id, {
                    queryParameters,
                  }).observable;
                case 'initiative':
                  return machineTranslationByInitiativeIdStream(id, {
                    queryParameters,
                  }).observable;
                case 'comment':
                  return machineTranslationByCommentIdStream(id, {
                    queryParameters,
                  }).observable;
              }
            }

            return of(null);
          })
        )
        .subscribe((machineTranslation) => {
          this.setState({
            machineTranslation: !isNilOrError(machineTranslation)
              ? machineTranslation.data
              : machineTranslation,
          });
        }),
    ];
  }

  componentDidUpdate() {
    const { attributeName, localeTo, id, context, resetOnChange } = this.props;
    this.inputProps$.next({
      attributeName,
      localeTo,
      id,
      context,
      resetOnChange,
    });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { machineTranslation } = this.state;
    return (children as children)(machineTranslation);
  }
}
