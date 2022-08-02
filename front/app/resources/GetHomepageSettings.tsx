import React from 'react';
import { Subscription } from 'rxjs';
import {
  homepageSettingsStream,
  IHomepageSettingsAttributes,
} from 'services/homepageSettings';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

type children = (
  renderProps: GetHomepageSettingsChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  homepageSettingsAttributes:
    | IHomepageSettingsAttributes
    | undefined
    | null
    | Error;
}

export type GetHomepageSettingsChildProps =
  | IHomepageSettingsAttributes
  | undefined
  | null
  | Error;

export default class GetHomepageSettings extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      homepageSettingsAttributes: null,
    };
  }

  componentDidMount() {
    const currentHomepageSettings$ = homepageSettingsStream().observable;

    this.subscriptions = [
      currentHomepageSettings$.subscribe((currentHomepageSettings) => {
        this.setState({
          homepageSettingsAttributes: !isNilOrError(currentHomepageSettings)
            ? currentHomepageSettings.data.attributes
            : currentHomepageSettings,
        });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { homepageSettingsAttributes } = this.state;
    return (children as children)(homepageSettingsAttributes);
  }
}
