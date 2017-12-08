// libraries
import * as React from 'react';

// Services
import { sendSpamReport, Report } from 'services/spamReports';

// Components
import { Section, SectionField, SectionTitle } from 'components/admin/Section';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Typings
interface Props {}
interface State {}

export default class SpamReportForm extends React.Component<Props, State> {

  handleSubmit = (event) => {
    event.preventDefault();
    console.log('sending report');
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <Section>
          <SectionTitle><FormattedMessage {...messages.title} /></SectionTitle>
        </Section>
      </form>
    );
  }
}
