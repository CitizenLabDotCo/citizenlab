import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { saveAs } from 'file-saver';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { isString } from 'utils/helperUtils';
import { reportError } from 'utils/loggingUtils';
import { requestBlob } from 'utils/request';
import { fontSizes } from 'utils/styleUtils';
import { API_PATH } from 'containers/App/constants';
import Button from 'components/UI/Button';
// i18n
import messages from '../../messages';
import tracks from '../../tracks';
import { exportType } from '../ExportMenu';

interface Props {
  exportQueryParameter: 'all' | string | string[];
  exportType: exportType;
}

interface State {
  exporting: boolean;
}

class ExportIdeasButton extends React.PureComponent<
  Props & WrappedComponentProps,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      exporting: false,
    };
  }

  handleExportIdeas = async () => {
    const {
      exportQueryParameter,
      intl: { formatDate, formatMessage },
    } = this.props;

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
      saveAs(
        blob,
        `${formatMessage(messages.inputsExportFileName)}_${formatDate(
          Date.now()
        )}.xlsx`
      );
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
        fontSize={`${fontSizes.s}px`}
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

export default injectIntl(ExportIdeasButton);
