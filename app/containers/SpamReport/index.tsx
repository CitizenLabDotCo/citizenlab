// libraries
import * as React from 'react';

// Services
import { sendSpamReport, Report } from 'services/spamReports';

// Components
import ReportForm from './SpamReportForm';

// Typings
import { API, Forms } from 'typings';
interface Props {
  resourceType: 'comments' | 'ideas';
  resourceId: string;
}

interface State {
  diff: Report;
}

class SpamReportForm extends React.Component<Props, State & Forms.crudParams> {
  reasonCodes: Report['reason_code'][] = ['wrong_content', 'inappropriate', 'other'];

  constructor (props) {
    super(props);

    this.state = {
      diff: {
        reason_code: 'wrong_content',
      },
      loading: false,
      errors: null,
      saved: false,
    };
  }

  handleSelectionChange = (reason_code) => {
    this.setState({ diff: { ...this.state.diff, reason_code } });
  }

  handleReasonTextUpdate = (other_reason) => {
    this.setState({ diff: { ...this.state.diff, other_reason } });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ loading: true });

    sendSpamReport(this.props.resourceType, this.props.resourceId, this.state.diff)
    .then((response) => {
      this.setState({ loading: false, saved: true });
    });
  }

  render () {
    return (
      <ReportForm
        reasonCodes={this.reasonCodes}
        diff={this.state.diff}
        onReasonChange={this.handleSelectionChange}
        onTextChange={this.handleReasonTextUpdate}
        onSubmit={this.handleSubmit}
        loading={this.state.loading}
        saved={this.state.saved}
        errors={this.state.errors}
      />
    );
  }
}

export default SpamReportForm;
