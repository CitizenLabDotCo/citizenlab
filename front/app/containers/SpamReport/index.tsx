// libraries
import React, { PureComponent } from 'react';

// Services
import { sendSpamReport, Report } from 'services/spamReports';

// Components
import ReportForm from './SpamReportForm';
import { ModalContentContainer } from 'components/UI/Modal';

// Typings
import { CRUDParams, CLErrorsJSON } from 'typings';

// Utils
import { isCLErrorJSON } from 'utils/errorUtils';

interface Props {
  resourceType: 'comments' | 'ideas' | 'initiatives';
  resourceId: string;
  className?: string;
}

interface State {
  diff: Report | null;
  loading: boolean;
  errors: CLErrorsJSON | Error | null;
  saved: boolean;
}

class SpamReportForm extends PureComponent<Props, State & CRUDParams> {
  reasonCodes: Report['reason_code'][] = [
    'wrong_content',
    'inappropriate',
    'other',
  ];

  constructor(props) {
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
      delete diff.other_reason;
    }

    this.setState({ diff, errors: null });
  };

  handleReasonTextUpdate = (other_reason) => {
    this.setState({
      diff: { ...this.state.diff, other_reason } as Report,
      errors: null,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();

    if (!this.state.diff) {
      return;
    }

    this.setState({ loading: true });

    sendSpamReport(
      this.props.resourceType,
      this.props.resourceId,
      this.state.diff
    )
      .then(() => {
        this.setState({
          loading: false,
          saved: true,
          errors: null,
          diff: null,
        });
      })
      .catch((e) => {
        if (isCLErrorJSON(e)) {
          this.setState({ errors: e.json.errors, loading: false });
        } else {
          this.setState({ errors: e, loading: false });
        }
      });
  };

  render() {
    return (
      <ModalContentContainer>
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
      </ModalContentContainer>
    );
  }
}

export default SpamReportForm;
