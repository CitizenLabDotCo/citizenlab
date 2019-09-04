// Libraries
import React from 'react';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// components
import Button from 'components/UI/Button';
// TODO import { exportPollResults } from 'services/pollResults';
const exportPollResults = ({ id, type }:Props) => console.log('exporting', id, type);

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  type: 'projects' | 'phases';
  id: string;
}

interface State {
  exporting: boolean;
}

export default class ExportPollButton extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      exporting: false,
    };
  }

  trackExportPoll = () => {
    trackEventByName(tracks.clickExportPoll.name, { extra: { ...this.props } });
  }

  handleExportPollResults = () => {
    this.trackExportPoll();

    this.setState({ exporting: true });
    exportPollResults(this.props);
    this.setState({ exporting: false });
  }

  render() {
    const { exporting } = this.state;
    return (
      <Button
        style="secondary"
        icon="download"
        onClick={this.handleExportPollResults}
        processing={exporting}
      >
        <FormattedMessage {...messages.exportPollResults} />
      </Button>
    );
  }
}
