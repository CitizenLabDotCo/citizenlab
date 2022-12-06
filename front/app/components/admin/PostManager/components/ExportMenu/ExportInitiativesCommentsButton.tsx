import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { saveAs } from 'file-saver';
import { isString } from 'lodash-es';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
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

class ExportCommentsButton extends React.PureComponent<
  Props & WrappedComponentProps,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      exporting: false,
    };
  }

  handleExportComments = async () => {
    const {
      exportQueryParameter: queryParameter,
      intl: { formatDate, formatMessage },
    } = this.props;

    const queryParametersObject = {};
    if (isString(queryParameter) && queryParameter !== 'all') {
      queryParametersObject['project'] = queryParameter;
    } else if (!isString(queryParameter)) {
      queryParametersObject['initiatives'] = queryParameter;
    }

    try {
      this.setState({ exporting: true });
      const blob = await requestBlob(
        `${API_PATH}/initiatives/comments/as_xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        queryParametersObject
      );
      saveAs(
        blob,
        `${formatMessage(
          messages.initiativesCommentsExportFileName
        )}_${formatDate(Date.now())}.xlsx`
      );
      this.setState({ exporting: false });
    } catch (error) {
      this.setState({ exporting: false });
    }

    // track this click for user analytics
    trackEventByName(tracks.clickExportComments.name);
  };

  render() {
    const { exportType } = this.props;
    const { exporting } = this.state;
    return (
      <Button
        buttonStyle="text"
        onClick={this.handleExportComments}
        processing={exporting}
        padding="0"
        fontSize={`${fontSizes.s}px`}
      >
        {exportType === 'all' && (
          <FormattedMessage {...messages.exportInitiativesComments} />
        )}
        {exportType === 'selected_posts' && (
          <FormattedMessage {...messages.exportSelectedInitiativesComments} />
        )}
      </Button>
    );
  }
}

export default injectIntl(ExportCommentsButton);
