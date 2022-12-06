// Libraries
import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { snakeCase } from 'lodash-es';
// typings
import { IParticipationContextType } from 'typings';
import { exportPollResponses } from 'services/pollResponses';
// analytics
import { trackEventByName } from 'utils/analytics';
// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
// components
import Button from 'components/UI/Button';
import messages from './messages';
import tracks from './tracks';

interface Props {
  participationContextType: IParticipationContextType;
  participationContextId: string;
  participationContextName: string;
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
    trackEventByName(tracks.clickExportPoll.name, { extra: { ...this.props } });
  };

  handleExportPollResults = async () => {
    const {
      intl: { formatMessage, formatDate },
      participationContextName,
      participationContextId,
      participationContextType,
    } = this.props;
    this.trackExportPoll();

    this.setState({ exporting: true });
    await exportPollResponses(
      participationContextId,
      participationContextType,
      `${formatMessage(messages.pollExportFileName)}_${snakeCase(
        participationContextName
      )}_${formatDate(Date.now())}.xlsx`
    );
    this.setState({ exporting: false });
  };

  render() {
    const { className } = this.props;
    const { exporting } = this.state;
    return (
      <Button
        buttonStyle="secondary"
        icon="download"
        onClick={this.handleExportPollResults}
        processing={exporting}
        className={className}
      >
        <FormattedMessage {...messages.exportPollResults} />
      </Button>
    );
  }
}

export default injectIntl(ExportPollButton);
