import React from 'react';
import Button from 'components/UI/Button';
import { fontSizes } from 'utils/styleUtils';

// i18n
import messages from '../../messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { exportType } from '../ExportMenu';
import { isString } from 'utils/helperUtils';
import { requestBlob } from 'utils/requestBlob';
import { API_PATH } from 'containers/App/constants';
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';
import { saveAs } from 'file-saver';
import { reportError } from 'utils/loggingUtils';
import { WrappedComponentProps } from 'react-intl';

interface Props {
  exportQueryParameter: 'all' | string | string[];
  exportType: exportType;
}

interface State {
  exporting: boolean;
}

class ExportInitiativesButton extends React.PureComponent<
  Props & WrappedComponentProps,
  State
> {
  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = {
      exporting: false,
    };
  }

  handleExportInitiatives = async () => {
    const {
      exportQueryParameter,
      intl: { formatDate, formatMessage },
    } = this.props;

    const queryParametersObject = {};
    if (isString(exportQueryParameter) && exportQueryParameter !== 'all') {
      queryParametersObject['project'] = exportQueryParameter;
    } else if (!isString(exportQueryParameter)) {
      queryParametersObject['initiatives'] = exportQueryParameter;
    }

    try {
      this.setState({ exporting: true });
      const blob = await requestBlob(
        `${API_PATH}/initiatives/as_xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        queryParametersObject
      );
      saveAs(
        blob,
        `${formatMessage(messages.initiativesExportFileName)}_${formatDate(
          Date.now()
        )}.xlsx`
      );
      this.setState({ exporting: false });
    } catch (error) {
      reportError(error);
      this.setState({ exporting: false });
    }

    // track this click for user analytics
    trackEventByName(tracks.clickExportInitiatives.name);
  };

  render() {
    const { exportType } = this.props;
    const { exporting } = this.state;
    return (
      <Button
        buttonStyle="text"
        onClick={this.handleExportInitiatives}
        processing={exporting}
        padding="0"
        fontSize={`${fontSizes.s}px`}
      >
        {exportType === 'all' && (
          <FormattedMessage {...messages.exportInitiatives} />
        )}
        {exportType === 'project' && (
          <FormattedMessage {...messages.exportInitiativesProjects} />
        )}
        {exportType === 'selected_posts' && (
          <FormattedMessage {...messages.exportSelectedInitiatives} />
        )}
      </Button>
    );
  }
}

export default injectIntl(ExportInitiativesButton);
