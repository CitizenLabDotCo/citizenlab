import React from 'react';

import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

import Button from 'components/UI/Button';
import { exportSurveyResults } from 'api/survey_results/utils';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  phaseId: string;
}

interface State {
  exporting: boolean;
}

export default class ExportSurveyButton extends React.PureComponent<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      exporting: false,
    };
  }

  trackExportSurvey = () => {
    trackEventByName(tracks.clickExportSurvey.name, {
      extra: { ...this.props },
    });
  };

  handleExportSurveyResults = () => {
    this.trackExportSurvey();

    this.setState({ exporting: true });
    exportSurveyResults(this.props);
    this.setState({ exporting: false });
  };

  render() {
    const { exporting } = this.state;
    return (
      <Button
        buttonStyle="secondary"
        icon="download"
        onClick={this.handleExportSurveyResults}
        processing={exporting}
      >
        <FormattedMessage {...messages.exportSurveyResults} />
      </Button>
    );
  }
}
