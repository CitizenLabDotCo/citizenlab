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
  diff: Report | null;
}

class SpamReportForm extends React.Component<Props, State & Forms.crudParams> {
  reasonCodes: Report['reason_code'][] = ['wrong_content', 'inappropriate', 'other'];

  constructor (props) {
    super(props);

    this.state = {
      diff: null,
      loading: false,
      errors: null,
      saved: false,
    };
  }

  handleSelectionChange = (reason_code) => {
    const diff = {
      ...this.state.diff,
      reason_code,
    } as Report;

    // Clear the "other reason" text when it's not necessary
    if (reason_code !== 'other') {
      diff.other_reason = '';
    }

    this.setState({ diff });
  }

  handleReasonTextUpdate = (other_reason) => {
    this.setState({ diff: { ...this.state.diff, other_reason } as Report });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (!this.state.diff) {
      return;
    }

    this.setState({ loading: true });

    sendSpamReport(this.props.resourceType, this.props.resourceId, this.state.diff)
    .then((response) => {
      this.setState({ loading: false, saved: true, errors: null, diff: null });
    })
    .catch((e) => {
      let errors = this.state.errors;
      if (e.json && e.json.errors) {
        errors = e.json.errors;
      }

      this.setState({ errors, loading: false });
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
        itemType={this.props.resourceType}
      />
    );
  }
}

export default SpamReportForm;
