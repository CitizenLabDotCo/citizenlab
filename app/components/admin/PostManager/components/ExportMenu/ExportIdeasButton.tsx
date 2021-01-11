import React from 'react';
import Button from 'components/UI/Button';
import { fontSizes } from 'utils/styleUtils';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { exportType } from '../ExportMenu';
import { isString } from 'util';
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';
import { saveAs } from 'file-saver';
import { reportError } from 'utils/loggingUtils';

interface Props {
  exportQueryParameter: 'all' | string | string[];
  exportType: exportType;
}

interface State {
  exporting: boolean;
}

export default class ExportIdeasButton extends React.PureComponent<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      exporting: false,
    };
  }

  handleExportIdeas = async () => {
    const { exportQueryParameter } = this.props;

    const queryParametersObject = {};
    if (isString(exportQueryParameter) && exportQueryParameter !== 'all') {
      queryParametersObject['project'] = exportQueryParameter;
    } else if (!isString(exportQueryParameter)) {
      queryParametersObject['ideas'] = exportQueryParameter;
    }

    try {
      this.setState({ exporting: true });
      const blob = await requestBlob(
        `${API_PATH}/ideas/as_xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        queryParametersObject
      );
      saveAs(blob, 'inputs-export.xlsx');
      this.setState({ exporting: false });
    } catch (error) {
      reportError(error);
      this.setState({ exporting: false });
    }

    // track this click for user analytics
    trackEventByName(tracks.clickExportIdeas.name);
  };

  render() {
    const { exportType } = this.props;
    const { exporting } = this.state;
    return (
      <Button
        buttonStyle="text"
        onClick={this.handleExportIdeas}
        processing={exporting}
        padding="0"
        fontSize={`${fontSizes.small}px`}
      >
        {exportType === 'all' && (
          <FormattedMessage {...messages.exportAllInputs} />
        )}
        {exportType === 'project' && (
          <FormattedMessage {...messages.exportInputsProjects} />
        )}
        {exportType === 'selected_posts' && (
          <FormattedMessage {...messages.exportSelectedInputs} />
        )}
      </Button>
    );
  }
}
