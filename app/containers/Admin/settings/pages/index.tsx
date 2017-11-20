// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';

// Components
import PageEditor from './PageEditor';

// Typing
interface Props {}

interface State {}

export default class AdminSettingsPages extends React.Component<Props, State> {
  subscriptions: Rx.Subscription[] = [];

  slugs = [
    'informations',
    'terms-and-conditions',
    'privacy-policy',
    'cookies-policy',
  ];

  constructor(props: Props) {
    super(props as any);

    this.state = {};
  }

  componentWillMount() {
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  render() {
    return (
      <div>
        {this.slugs.map((slug) => (
          <PageEditor key={slug} slug={slug} />
        ))}
      </div>
    );
  }
}
