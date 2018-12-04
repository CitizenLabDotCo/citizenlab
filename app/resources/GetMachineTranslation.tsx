import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import {
  IMachineTranslationData,
  machineTranslationByIdeaIdStream,
  machineTranslationByCommentIdStream
} from 'services/machineTranslations';
import { isNilOrError } from 'utils/helperUtils';
import { Locale } from 'typings';

interface InputProps {
  attributeName: 'body_multiloc' | 'title_multiloc';
  localeTo: Locale;
  ideaId?: string;
  commentId?: string;
  resetOnChange?: boolean;
}

export type GetMachineTranslationChildProps = IMachineTranslationData | undefined | null | Error;

type children = (renderProps: GetMachineTranslationChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  machineTranslation: GetMachineTranslationChildProps;
}

export default class GetMachineTranslation extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      machineTranslation: undefined
    };
  }

  componentDidMount() {
    const { attributeName, localeTo, ideaId, commentId, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ attributeName, localeTo, ideaId, commentId, resetOnChange });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        tap(() => resetOnChange && this.setState({ machineTranslation: undefined })),
        switchMap(({ ideaId, commentId }) => {
          console.log('attribute name: ' + attributeName);
          if (isString(ideaId)) {
            return machineTranslationByIdeaIdStream(ideaId,
              {
                queryParameters: { machine_translation: { attribute_name: attributeName, locale_to: localeTo } },
                cacheStream: false
              }
            ).observable;
          } else if (isString(commentId)) {
            return machineTranslationByCommentIdStream(commentId,
              {
                queryParameters: { machine_translation: { attribute_name: attributeName, locale_to: localeTo } },
                cacheStream: false
              }
            ).observable;
          }

          return of(null);
        })
      )
      .subscribe((machineTranslation) => {
        this.setState({ machineTranslation: !isNilOrError(machineTranslation) ? machineTranslation.data : machineTranslation });
      })
    ];
  }

  componentDidUpdate() {
    const { attributeName, localeTo, ideaId, commentId, resetOnChange } = this.props;
    this.inputProps$.next({ attributeName, localeTo, ideaId, commentId, resetOnChange });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { machineTranslation } = this.state;
    console.log('resource');
    console.log(this.props.attributeName);
    console.log(machineTranslation);
    return (children as children)(machineTranslation);
  }
}
