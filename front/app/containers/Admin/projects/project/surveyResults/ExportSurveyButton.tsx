import React from 'react';

// analytics

import { exportSurveyResults } from 'api/survey_results/utils';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import tracks from './tracks';

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
    trackEventByName(tracks.clickExportSurvey, {
      phaseId: this.props.phaseId,
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
      <ButtonWithLink
        buttonStyle="secondary-outlined"
        icon="download"
        onClick={this.handleExportSurveyResults}
        processing={exporting}
      >
        <FormattedMessage {...messages.exportSurveyResults} />
      </ButtonWithLink>
    );
  }
}
