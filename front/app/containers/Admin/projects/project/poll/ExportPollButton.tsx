import React from 'react';

// analytics
import { snakeCase } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';

import exportPollResponses from 'api/poll_responses/exportPollResponses';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

import messages from './messages';
import tracks from './tracks';

interface Props {
  phaseId: string;
  phaseName: string;
  className?: string;
}

interface State {
  exporting: boolean;
}

class ExportPollButton extends React.PureComponent<
  Props & WrappedComponentProps,
  State
> {
  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = {
      exporting: false,
    };
  }

  trackExportPoll = () => {
    trackEventByName(tracks.clickExportPoll, {
      phaseId: this.props.phaseId,
      phaseName: this.props.phaseName,
    });
  };

  handleExportPollResults = async () => {
    const {
      intl: { formatMessage, formatDate },
      phaseName,
      phaseId,
    } = this.props;
    this.trackExportPoll();

    this.setState({ exporting: true });
    await exportPollResponses(
      phaseId,
      `${formatMessage(messages.pollExportFileName)}_${snakeCase(
        phaseName
      )}_${formatDate(Date.now())}.xlsx`
    );
    this.setState({ exporting: false });
  };

  render() {
    const { className } = this.props;
    const { exporting } = this.state;
    return (
      <ButtonWithLink
        buttonStyle="secondary-outlined"
        icon="download"
        onClick={this.handleExportPollResults}
        processing={exporting}
        className={className}
      >
        <FormattedMessage {...messages.exportPollResults} />
      </ButtonWithLink>
    );
  }
}

export default injectIntl(ExportPollButton);
